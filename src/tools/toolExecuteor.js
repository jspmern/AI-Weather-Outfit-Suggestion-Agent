import { outFitTools } from "./outfitTool.js";
import { webApiSearch } from "./weatherTool.js";

export const toolExecutor = async (tool_call) => {
  console.log("tool_calling.............................", tool_call.function.name);
  if (tool_call.function.name === "webApiSearch") {
    const data = JSON.parse(tool_call.function.arguments ?? "{}");
    const resultFromWebApiTools = await webApiSearch(data);
    return resultFromWebApiTools;
  }
  if (tool_call.function.name === "outFitTools") {
    const data = JSON.parse(tool_call.function.arguments ?? "{}");
    const resultFromWebApiTools = await outFitTools(data);
    return resultFromWebApiTools;
  }
  throw new Error(`Unknown tool: ${tool_call.function.name}`);
};
