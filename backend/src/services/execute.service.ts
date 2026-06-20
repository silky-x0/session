import { AppError } from "../middleware/errorHandler";
import { config } from "../config/env";

export interface CodeRequest {
  language: string;
  code: string;
  stdin?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  memory?: string | number;
  cpuTime?: string | number;
}

// Map frontend supported languages to JDoodle API language codes and stable version indices
const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  python: { language: "python3", versionIndex: "4" },      // Python 3.10.8
  javascript: { language: "nodejs", versionIndex: "4" },  // Node.js 18.0.0
  typescript: { language: "typescript", versionIndex: "1" }, // TypeScript 7.0
  c: { language: "c", versionIndex: "7" },                // GCC 7.0
  cpp: { language: "cpp", versionIndex: "7" },            // GCC 7.0
  java: { language: "java", versionIndex: "4" },          // JDK 17.0.1
  go: { language: "go", versionIndex: "4" },              // Go 1.19
  rust: { language: "rust", versionIndex: "4" },          // Rust 1.68
  swift: { language: "swift", versionIndex: "6" },        // Swift 7.0
  zig: { language: "zig", versionIndex: "0" },            // Zig 0.15.2
};

export const supportedLanguages = Object.keys(LANGUAGE_MAP);

/**
 * Handles code execution by sending it to JDoodle API
 */
export const handleCodeExecution = async ({
  language,
  code,
  stdin,
}: CodeRequest): Promise<ExecutionResult> => {
  const jdoodleConfig = LANGUAGE_MAP[language.toLowerCase()];

  if (!jdoodleConfig) {
    throw new AppError(
      400,
      `Unsupported language: "${language}". Supported: ${supportedLanguages.join(", ")}`,
    );
  }

  const clientId = config.jdoodleClientId;
  const clientSecret = config.jdoodleClientSecret;

  if (!clientId || !clientSecret) {
    throw new AppError(
      500,
      "JDoodle API credentials are not configured in the server environment",
    );
  }

  try {
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        language: jdoodleConfig.language,
        versionIndex: jdoodleConfig.versionIndex,
        stdin: stdin || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JDoodle API returned HTTP ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as {
      output: string;
      statusCode: number;
      memory?: string | number;
      cpuTime?: string | number;
    };

  
    return {
      stdout: result.output || "",
      stderr: "",
      exitCode: result.statusCode === 200 ? 0 : result.statusCode,
      timedOut: false,
      memory: result.memory,
      cpuTime: result.cpuTime,
    };
  } catch (error: any) {
    console.error("JDoodle Code Execution Error:", error);
    throw new AppError(
      500,
      `Failed to execute code via JDoodle: ${error.message || error}`,
    );
  }
};
