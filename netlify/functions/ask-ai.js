import { GoogleGenAI } from "@google/genai";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { model, contents, config } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API_KEY 環境變數未設定" }),
      };
    }

    const aiClient = new GoogleGenAI({ apiKey });
    
    const response = await aiClient.models.generateContent({
      model: model || "gemini-2.5-pro",
      contents,
      config,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error) {
    console.error("AI Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
