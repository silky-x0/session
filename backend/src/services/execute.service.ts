import { AppError } from "../middleware/errorHandler";
import { config } from "../config/env";

export interface CodeRequest {
  language: string;
  code: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

// Map frontend supported languages to JDoodle API language codes and stable version indices
const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  python: { language: "python3", versionIndex: "4" },      // Python 3.10.8
  javascript: { language: "nodejs", versionIndex: "4" },  // Node.js 18.0.0
  c: { language: "c", versionIndex: "5" },                // GCC (C)
  cpp: { language: "cpp", versionIndex: "5" },            // GCC (C++)
};

export const supportedLanguages = Object.keys(LANGUAGE_MAP);


export const handleCodeExecution = async ({
  language,
  code,
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
    };
  } catch (error: any) {
    console.error("❌ JDoodle Code Execution Error:", error);
    throw new AppError(
      500,
      `Failed to execute code via JDoodle: ${error.message || error}`,
    );
  }
};
