import "dotenv/config";
import express from "express";
import cors from "cors";
import { legalAdvisorApp } from "./orchestrator.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { callWithFallback } from "./modelProvider.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

app.use(cors());
app.use(express.json());

// Main advice endpoint
app.post("/api/advice", async (req, res) => {
  try {
    const { story, history } = req.body;
    
    if (!story) {
       res.status(400).json({ error: "Please provide a 'story' in the request body." });
       return;
    }

    console.log("Starting LangGraph workflow for new story...");
    
    // Invoke the graph
    const result = await legalAdvisorApp.invoke({
      user_story: story,
      history: history || []
    });

    // Send back the results
    res.json({
      success: true,
      data: {
        category: result.law_category,
        facts: result.key_facts,
        kanoon_results: result.api_results,
        advice: result.legal_advice,
        action_plan: result.action_plan
      }
    });

  } catch (error: any) {
    console.error("Error processing story:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

app.post("/api/refine-rti", async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) {
       res.status(400).json({ error: "Missing raw_text" });
       return;
    }

    console.log("Refining RTI request...");

    const prompt = PromptTemplate.fromTemplate(`
You are an expert legal assistant specializing in the Indian Right to Information (RTI) Act, 2005.
The user has provided a raw, informal description of the information they want to request from a government department.
Your task is to reframe and properly address their request into a formal, clear, and highly specific numbered list of questions or document requests suitable for an official RTI application.

Guidelines:
1. Make it sound highly professional and legally formal.
2. Structure it as a clear numbered list.
3. Remove any emotional language, complaints, or unnecessary backstory.
4. Ensure the scope is specific so the department cannot reject it for being "vague".
5. Only output the refined request text. DO NOT include greetings, closings, or any surrounding text.

User's Raw Request:
{raw_text}

Formal RTI Request Text:
`);

    // Use callWithFallback with a ChatPromptTemplate-compatible prompt
    const { ChatPromptTemplate } = await import("@langchain/core/prompts");
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert legal assistant specializing in the Indian Right to Information (RTI) Act, 2005."],
      ["human", `The user has provided a raw, informal description of the information they want to request from a government department.
Your task is to reframe and properly address their request into a formal, clear, and highly specific numbered list of questions or document requests suitable for an official RTI application.

Guidelines:
1. Make it sound highly professional and legally formal.
2. Structure it as a clear numbered list.
3. Remove any emotional language, complaints, or unnecessary backstory.
4. Ensure the scope is specific so the department cannot reject it for being "vague".
5. Only output the refined request text. DO NOT include greetings, closings, or any surrounding text.

User's Raw Request:
{raw_text}

Formal RTI Request Text:`]
    ]);

    const response = await callWithFallback(chatPrompt, { raw_text }, { temperature: 0.2 });
    
    res.json({ success: true, refined_text: response.content });
  } catch (error: any) {
    console.error("Error refining RTI:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Legal Advisor Backend running on http://localhost:${PORT}`);
});
