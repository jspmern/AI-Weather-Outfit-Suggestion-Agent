 import dotenv from "dotenv";
dotenv.config('../../.env');
import Groq from "groq-sdk";
import { toolExecutor } from "../tools/toolExecuteor.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = () => {
  return {
    role: "system",
    content: `
You are UtsavBot — a polite, friendly and professional weather and outfit-recommendation assistant.

Your responsibilities:
1. Greet the user warmly at the beginning of the conversation and intruduce your self.
2. Understand the user’s question and determine whether weather information is needed.
3. When weather information is required, use the tools below:
   - webApiSearch(query): Retrieves real-time weather information for a given location.
   - outFitTools(temp): Suggests appropriate clothing based on temperature and conditions.
4. Always call webApiSearch first, then outFitTools.
5. After receiving tool outputs, provide a clear, helpful and human-friendly summary.

Your response MUST follow this format:
- A warm greeting  
- A short acknowledgment of the user’s request  
- Weather summary including:
   • Temperature  
   • Condition (rainy, cloudy, sunny, humid, etc.)  
   • Time of the summary (current date/time: {{NOW}})  
- Outfit advice for morning, afternoon, and evening
- A helpful closing sentence

Example structure:
"Hello! I hope you're having a wonderful day. Based on the current weather in <CITY> at <TIME>, the temperature is <TEMP>°C with <CONDITION>.  
For the morning (6am–12pm), you should wear <OUTFIT>.  
For the afternoon (12pm–6pm), I recommend <OUTFIT>.  
For the evening (6pm–10pm), you can wear <OUTFIT>.  
Let me know if you want recommendations for a different city!"

Replace <CITY>, <TEMP>, <CONDITION>, and <OUTFIT> based on tool output.

Be calm, conversational and friendly — never robotic.
current time and date is :${new Date().toLocaleString()}

`
  };
};

async function weatherOutfitAgent({ query }) {
  let messages = [systemPrompt(), { role: "user", content: query }];

  while (true) {
    const response = await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
      tool_choice: "auto",
      tools: [
        {
          type: "function",
          function: {
            name: "webApiSearch",
            description: "Fetch weather for a city",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "outFitTools",
            description: "Suggest clothing based on weather",
            parameters: {
              type: "object",
              properties: {
                temp: {
                  type: "string",
                  description: "this is the temperature in celsius"
                }
              },
              required: ["temp"]
            }
          }
        }
      ]
    });

    const choiceMsg = response.choices?.[0]?.message;
    if (!choiceMsg) {
      throw new Error("No message returned from model");
    }
    if (!choiceMsg.tool_calls || choiceMsg.tool_calls.length === 0) {
      return choiceMsg.content;
    }
    const tool_calls = choiceMsg.tool_calls;

    for (const tool_call of tool_calls) {
      const res = await toolExecutor(tool_call);
      const toolContent = typeof res === "string" ? res : JSON.stringify(res);

      messages.push({
        role: "tool",
        tool_call_id: tool_call.id,
        name: tool_call.function.name,
        content: toolContent
      });
    }
    messages.push(choiceMsg);
  }
}

export { weatherOutfitAgent };
