import dotenv from "dotenv";
dotenv.config('../../.env');
import { tavily } from "@tavily/core"
const tvly = tavily({ apiKey:  process.env.TRAVILY_API_KEY });
 export const webApiSearch=async({query})=>{
    const response = await tvly.search(`what is the  ${query} ?`);
    const result=response.results.map(item=>item.content).join('\n\n\n')
    console.log(result)
    return result;
 }



 