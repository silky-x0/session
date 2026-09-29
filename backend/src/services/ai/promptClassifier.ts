import { openRouter } from "../../config/openRouter";

export async function classifyPrompt(prompt: string): Promise<"problem" | "profile"> {
  const profileKeywords = ["dev", "engineer", "yoe", "years of experience", "senior", "junior", "backend", "frontend", "fullstack", "role"];
  const lowerPrompt = prompt.toLowerCase();
  
  if (profileKeywords.some(kw => lowerPrompt.includes(kw))) {
    return "profile";
  }

  try {
    const response = await openRouter.chat.send({
      model: "openrouter/free",
      messages: [
        { role: "system", content: "Is this a specific algorithm/problem or a role/topic brief? Reply only with 'problem' or 'profile'." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });
    
    const content = response.choices[0]?.message?.content;
    let text = "";
    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(content)) {
      text = content.map((item: any) => ("text" in item ? item.text : "")).join("");
    }
    
    text = text.trim().toLowerCase();
    
    if (text === "profile") return "profile";
    return "problem";
  } catch (error) {
    return "problem"; 
  }
}
