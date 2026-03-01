import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import {
  handleCodeExecution,
  supportedLanguages,
} from "../services/execute.service";

export const executeCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { language, code } = req.body;

  if (!code || !language) {
    throw new AppError(400, "Both 'language' and 'code' fields are required");
  }

  if (!supportedLanguages.includes(language.toLowerCase())) {
    throw new AppError(
      400,
      `Unsupported language: "${language}". Supported: ${supportedLanguages.join(", ")}`,
    );
  }

  const result = await handleCodeExecution({ language, code });

  res.json(result);
};
