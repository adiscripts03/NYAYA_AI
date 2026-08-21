import "dotenv/config";
import express from "express";
import cors from "cors";
import { legalAdvisorApp } from "./orchestrator.js";

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

app.listen(PORT, () => {
  console.log(`Legal Advisor Backend running on http://localhost:${PORT}`);
});
