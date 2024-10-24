// openaiConfig.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "sk-uhFJvxYJAG1wx7jgUEZhqQqKiols_xR5H6ha-cuBrBT3BlbkFJNcjJLgxfNNr5DbZoF9-kbmHL6wYVtVF-0gSVtGR_gA",
  dangerouslyAllowBrowser: true,
});

export { openai };