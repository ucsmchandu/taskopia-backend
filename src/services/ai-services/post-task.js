const express = require('express')
const ai = require("./initialize-ai");
/**
 * Helper function that converts a user's rough task request into structured task details using AI.
 * @param {string} userPrompt - The user's rough task request.
 * @returns {{taskTitle: string, taskDescription: string, taskBudget: number, category: string, estimatedTimeHours: number}} Resolves after generating the task details from the AI model.
 */
const taskPostingHelper = async (req, res) => {
  const { userPrompt } = req.body;
  /**
   * here we will receive the basic prompt from the user based on that we have to get the task posting details from the AI
   * receiving data: basic prompt (eg: i want a person for help me to things shifting from one home another home)
   *
   * wanted data is:
   * task title
   * task description
   * task budget
   * category
   * estimated time (in hours)
   */
  //   const demoPrompt = "i want a person to work in grocery shop for 2 days";
  const prompt = `
    You are an AI assistant for a task marketplace. Convert the user's rough request into a structured task posting.

Input:
- ${userPrompt}

Output:
Return valid JSON only with this exact structure:
{
  "taskTitle": "",
  "taskDescription": "",
  "taskBudget": 0,
  "category": "",
  "estimatedTimeHours": 0
}

Rules:
- Infer a clear, professional task title.
- Write a concise but useful task description.
- Estimate a realistic budget in local currency.
- Choose the most relevant category.
- Estimate the time in hours.
- If the request is vague, make reasonable assumptions.
- Do not include extra text, explanation, or markdown.
- Don't use any M dashes.

Example input:
"I want a person to help me shift things from one home to another home"

Example output:
{
  "taskTitle": "Home Shifting Assistance",
  "taskDescription": "Need help moving household items from one home to another. Assistance with loading, unloading, and careful handling of belongings.",
  "taskBudget": 1500,
  "category": "Moving & Packing",
  "estimatedTimeHours": 4
}
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const rawText = response.text;

    let parsedData = null;

    try {
      parsedData = JSON.parse(rawText)
    } catch (err) {
      parsedData = {
        error: "AI response was not valid JSON",
        raw:rawText
      }
    }
    return res.status(200).json(parsedData);
    console.log(response.text);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to generate the task details.",
      details: err.message
    })
  }
};



module.exports = taskPostingHelper;
