import "dotenv/config";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

// 1. Graph State (`LegalAgentState`)
export const LegalAgentState = Annotation.Root({
  user_story: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  history: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  law_category: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  key_facts: Annotation<Record<string, any>>({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  api_results: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  legal_advice: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  action_plan: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  errors: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

// Infer the type from Annotation
export type LegalAgentStateType = typeof LegalAgentState.State;

// Define your LLM instance (ensure you have process.env.GROQ_API_KEY set)
const llm = new ChatGroq({
  model: "openai/gpt-oss-20b", // Reverting to the model specified by your friend
  temperature: 0,
});

// 2. Graph Nodes (The Agents)

// TriageNode: Classifies the user_story into a specific legal category.
async function triageNode(state: LegalAgentStateType): Promise<Partial<LegalAgentStateType>> {
  console.log("--- TRIAGE NODE ---");
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert Indian Legal routing assistant. Classify the user's story into one of the following categories: 'Criminal', 'Civil', 'Family', 'Property', 'Corporate', 'Labor', or 'Other'. Respond ONLY with the category name."],
    ["human", "{user_story}"]
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({ user_story: state.user_story });
  
  return { law_category: response.content.toString().trim() };
}

// FactExtractorNode: Extracts entities into strict JSON.
async function factExtractorNode(state: LegalAgentStateType): Promise<Partial<LegalAgentStateType>> {
  console.log("--- FACT EXTRACTOR NODE ---");
  
  const factSchema = z.object({
    incident_type: z.string().describe("The primary nature of the incident (e.g., theft, divorce, breach of contract)."),
    date_of_incident: z.string().describe("The date or time period the incident occurred, if mentioned. Otherwise 'Unknown'."),
    parties_involved: z.array(z.string()).describe("The roles of the people involved (e.g., Landlord, Tenant, Spouse, Employer)."),
    core_issue_summary: z.string().describe("A 1-sentence summary of the main legal issue."),
  });

  const structuredLlm = llm.withStructuredOutput(factSchema, { name: "extract_facts" });
  
  try {
    const extractedFacts = await structuredLlm.invoke([
      new SystemMessage("You are an expert legal data extractor. Extract the key facts from the user's story into the required JSON structure."),
      new HumanMessage(state.user_story)
    ]);
    return { key_facts: extractedFacts };
  } catch (error: any) {
    return { errors: [error.message || "Extraction Failed"] };
  }
}

// KanoonAPINode: Takes extracted facts, queries Kanoon API.
async function kanoonAPINode(state: LegalAgentStateType): Promise<Partial<LegalAgentStateType>> {
  console.log("--- KANOON API NODE ---");
  
  const token = process.env.KANOON_API_TOKEN;
  if (!token) {
    console.warn("KANOON_API_TOKEN not found in environment. Using mock data.");
    return { api_results: [{ 
      case: "Mock State vs Defendant", 
      summary: "Mock result: Section 379 IPC for theft applies. The court held that taking property without consent is punishable." 
    }] };
  }

  try {
    // Construct search query from facts
    const query = `${state.key_facts.incident_type || ""} ${state.key_facts.core_issue_summary || ""}`.trim();
    const encodedQuery = encodeURIComponent(query);
    
    // Indian Kanoon search endpoint
    const url = `https://api.indiankanoon.org/search/?formInput=${encodedQuery}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Kanoon API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // The Kanoon API typically returns results in a 'docs' array
    const docs = data.docs || [];
    
    // Map top 3 results to a simpler structure to avoid overloading the LLM context window
    const api_results = docs.slice(0, 3).map((doc: any) => ({
      title: doc.title,
      headline: doc.headline, // Contains highlighted snippet
      docsource: doc.docsource
    }));

    return { api_results };
  } catch (error: any) {
    console.error("Kanoon API Error:", error.message);
    return { errors: [error.message || "Failed to fetch from Kanoon API"] };
  }
}

// LegalAdvisorNode: Acts as a RAG agent, translating legalese.
async function legalAdvisorNode(state: LegalAgentStateType): Promise<Partial<LegalAgentStateType>> {
  console.log("--- LEGAL ADVISOR NODE ---");
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a compassionate and knowledgeable Indian Legal Advisor. Your goal is to explain the user's legal situation to them in simple, plain English that a layperson can understand. Avoid complex legalese. 
    
IMPORTANT FORMATTING RULES:
1. Do NOT use markdown tables.
2. Provide your response as a clear, easy-to-read, point-wise list. 
3. Keep paragraphs short and concise. Do not write a wall of text.

Use the following context to inform your advice:
Category: {law_category}
Key Facts: {key_facts}
Case Laws & Statutes (from API): {api_results}
Conversation History: {history}
`],
    ["human", "Here is my latest story: {user_story}\n\nPlease give me clear and simple legal advice based on this and our history."]
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({
    law_category: state.law_category,
    key_facts: JSON.stringify(state.key_facts, null, 2),
    api_results: JSON.stringify(state.api_results, null, 2),
    history: JSON.stringify(state.history, null, 2),
    user_story: state.user_story
  });

  return { legal_advice: response.content.toString() };
}

// ActionPlanNode: Drafts 3-5 immediate steps.
async function actionPlanNode(state: LegalAgentStateType): Promise<Partial<LegalAgentStateType>> {
  console.log("--- ACTION PLAN NODE ---");
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a legal strategist. Based on the provided legal advice and conversation history, create a highly actionable, step-by-step plan for the user. Keep it to 3 to 5 concrete bullet points. Be direct and clear.

IMPORTANT DIRECTIVE: You MUST provide exact URLs to relevant Indian government complaint portals where applicable. 
CRITICAL: You must format all URLs as clickable markdown links, for example: [National Cyber Crime Portal](https://cybercrime.gov.in). Do not just output raw text URLs. Do not give generic advice like "file a complaint online" without giving the exact, clickable portal link.`],
    ["human", "Conversation History:\n{history}\n\nLegal Advice:\n{legal_advice}\n\nWhat should I do next?"]
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({ 
    legal_advice: state.legal_advice,
    history: JSON.stringify(state.history, null, 2)
  });

  return { action_plan: response.content.toString() };
}

// Conditional Edge Logic for Fact Extractor Retry Loop
function checkExtractionSuccess(state: LegalAgentStateType): string {
  if (state.errors.length > 0 && Object.keys(state.key_facts).length === 0) {
    if (state.errors.length < 3) {
      console.log("--- RETRYING FACT EXTRACTION ---");
      return "retry"; 
    } else {
      console.log("--- MAX RETRIES REACHED, PROCEEDING WITH EMPTY FACTS ---");
      return "proceed";
    }
  }
  return "proceed";
}

// 3. Graph Wiring
const workflow = new StateGraph(LegalAgentState)
  .addNode("triage", triageNode)
  .addNode("factExtractor", factExtractorNode)
  .addNode("kanoonApi", kanoonAPINode)
  .addNode("legalAdvisor", legalAdvisorNode)
  .addNode("actionPlan", actionPlanNode)
  .addEdge(START, "triage")
  .addEdge("triage", "factExtractor")
  .addConditionalEdges(
    "factExtractor",
    checkExtractionSuccess,
    {
      retry: "factExtractor",
      proceed: "kanoonApi"
    }
  )
  .addEdge("kanoonApi", "legalAdvisor")
  .addEdge("legalAdvisor", "actionPlan")
  .addEdge("actionPlan", END);

// Compile the graph
export const legalAdvisorApp = workflow.compile();
