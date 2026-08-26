import { AppError } from "../middleware/errorHandler";

const KB = 1024;

/**
 * Per-field payload size limits.
 * The global express.json() body cap is the outer boundary (512 KB);
 * these limits guard individual fields before they reach paid services
 * (JDoodle credits, AI tokens) or get echoed back in error messages.
 */
export const PAYLOAD_LIMITS = {
  codeBytes: 20 * KB, // roadmap: cap code execution strings at 20 KB
  stdinBytes: 10 * KB,
  promptBytes: 8 * KB,
  codeContextBytes: 20 * KB,
  historyEntries: 50,
  languageChars: 32,
} as const;

const byteLength = (value: unknown): number => {
  if (typeof value === "string") {
    return Buffer.byteLength(value, "utf8");
  }
  return Buffer.byteLength(String(value ?? ""), "utf8");
};

/**
 * Throws 413 when the given field exceeds maxBytes.
 * Skips undefined/null values — presence checks belong to the controller.
 */
export const assertSizeLimit = (
  value: unknown,
  maxBytes: number,
  fieldName: string,
): void => {
  if (value === undefined || value === null) return;

  if (byteLength(value) > maxBytes) {
    throw new AppError(
      413,
      `'${fieldName}' exceeds the maximum allowed size of ${Math.round(maxBytes / KB)} KB`,
    );
  }
};
