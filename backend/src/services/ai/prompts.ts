export function buildFollowUpPrompt(
  type: "problem" | "profile",
  originalPrompt: string,
  previousTitles: string[],
  questionNumber: number
) {
  if (type === "problem") {
    return `You are generating question ${questionNumber} of 5 in a coding interview set.
Original topic: "${originalPrompt}"
Previously generated questions: ${previousTitles.join(", ")}

Generate a DIFFERENT but RELATED problem in the same family.
Rules:
- Must NOT be identical or trivially similar to any previous question.
- Should be slightly harder or explore a distinct edge case or variation.
- Use the same programming language as Q1.
Return a raw JSON object (no markdown) with the same structure as before.`;
  } else {
    return `You are generating question ${questionNumber} of 5 for a technical interview.
Candidate profile: "${originalPrompt}"
Questions already generated cover these domains/topics: ${previousTitles.join(", ")}

Generate a question for a DIFFERENT domain (e.g. arrays → system design → concurrency → DB).
Difficulty must match the candidate's seniority.
Return a raw JSON object (no markdown) with the same structure as before.`;
  }
}
