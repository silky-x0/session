import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import {
  handleCodeExecution,
  supportedLanguages,
} from "../services/execute.service";
import { PAYLOAD_LIMITS, assertSizeLimit } from "../utils/payloadLimits";

export const executeCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { language, code, stdin } = req.body;

  if (!code || !language) {
    throw new AppError(400, "Both 'language' and 'code' fields are required");
  }

  // Cap language length before it can be reflected back in error messages
  if (typeof language !== "string" || language.length > PAYLOAD_LIMITS.languageChars) {
    throw new AppError(413, `'language' exceeds the maximum allowed length of ${PAYLOAD_LIMITS.languageChars} characters`);
  }

  assertSizeLimit(code, PAYLOAD_LIMITS.codeBytes, "code");
  assertSizeLimit(stdin, PAYLOAD_LIMITS.stdinBytes, "stdin");

  if (!supportedLanguages.includes(language.toLowerCase())) {
    throw new AppError(
      400,
      `Unsupported language: "${language}". Supported: ${supportedLanguages.join(", ")}`,
    );
  }

  const result = await handleCodeExecution({ language, code, stdin });

  res.json(result);
};
