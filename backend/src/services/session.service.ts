import { openRouter } from "../config/openRouter";
import { AppError } from "../middleware/errorHandler";

export const generateOpenRouterContent = async (prompt: string) => {

    const systemPrompt = `
  You are an expert technical interview coach. The user will provide a problem or topic.
  Return a raw JSON object (no markdown) with this structure:
  {
    "title": "Short descriptive title",
    "language": "lowercase language identifier (use: javascript, typescript, python, cpp, java, go, rust, c, html, css, json)",
    "content": "The code template or solution",
    "difficulty": "Easy | Medium | Hard",
    "starter_code": "A boilerplate version with just the function signature and docstrings",
    "hints": ["Hint 1 for the interviewer", "Hint 2 for the interviewer"],
    "complexity": { "time": "O(...)", "space": "O(...)" },
    "question": "the question given by user if leetcode paste exact question with 1 example if not then generate a question according to user prompt"
  }
  
  IMPORTANT: For the "language" field:
  - Use "cpp" for C++, NOT "c++" or "C++"
  - Use "python" for Python
  - Use "javascript" for JavaScript
  - Use "typescript" for TypeScript
  - Use "java" for Java
  - Use "go" for Go/Golang
  
  If the prompt is an interview topic, provide a classic problem associated with it. 
  Ensure the 'content' includes clear comments explaining the logic for pair learning.
`;

    const completion = await openRouter.chat.send({
      model: "arcee-ai/trinity-mini:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    let text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new AppError(501,"No content generated");
    }

    // Handle case where content is an array (multimodal response)
    if (typeof text !== "string") {
      if (Array.isArray(text)) {
        text = text.map((item) => ("text" in item ? item.text : "")).join("");
      } else {
        text = String(text);
      }
    }

    // Clean up markdown if present, just in case
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    if (!cleanText) {
      throw new AppError(502, "Falied To generate content")
    }

    return JSON.parse(cleanText);
};
