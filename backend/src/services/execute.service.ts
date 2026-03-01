import Docker from "dockerode";
import { AppError } from "../middleware/errorHandler";

const docker = new Docker();

export interface LanguageConfig {
  image: string;
  buildCmd: (code: string) => string[];
}

const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  python: {
    image: "python:3.11-alpine",
    buildCmd: (code) => ["python3", "-c", code],
  },
  javascript: {
    image: "node:20-alpine",
    buildCmd: (code) => ["node", "-e", code],
  },
  c: {
    image: "gcc:latest",
    buildCmd: (code) => [
      "sh",
      "-c",
      `echo '${code.replace(/'/g, "'\\''")}' > main.c && gcc main.c -o main && ./main`,
    ],
  },
  cpp: {
    image: "gcc:latest",
    buildCmd: (code) => [
      "sh",
      "-c",
      `echo '${code.replace(/'/g, "'\\''")}' > main.cpp && g++ main.cpp -o main && ./main`,
    ],
  },
};

export const supportedLanguages = Object.keys(LANGUAGE_MAP);


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


const EXECUTION_TIMEOUT_MS = 10_000; // 10s



/**
 * Strip the Docker multiplexed-stream 8-byte header from each frame
 * and return the raw text payload.
 */
function demuxBuffer(buffer: Buffer): { stdout: string; stderr: string } {
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset + 8 <= buffer.length) {
    const streamType = buffer[offset]; // 1 = stdout, 2 = stderr
    const size = buffer.readUInt32BE(offset + 4);
    const payload = buffer
      .subarray(offset + 8, offset + 8 + size)
      .toString("utf-8");

    if (streamType === 1) stdout += payload;
    else if (streamType === 2) stderr += payload;

    offset += 8 + size;
  }

  return { stdout, stderr };
}


export const handleCodeExecution = async ({
  language,
  code,
}: CodeRequest): Promise<ExecutionResult> => {
  const langConfig = LANGUAGE_MAP[language.toLowerCase()];

  if (!langConfig) {
    throw new AppError(
      400,
      `Unsupported language: "${language}". Supported: ${supportedLanguages.join(", ")}`,
    );
  }

  const container = await docker.createContainer({
    Image: langConfig.image,
    Cmd: langConfig.buildCmd(code),
    Tty: false,
    HostConfig: {
      Memory: 256 * 1024 * 1024, // 256 MB
      NanoCpus: 1e9, // 1 CPU
      PidsLimit: 64,
      NetworkMode: "none",
      CapDrop: ["ALL"],
      SecurityOpt: ["no-new-privileges"],
    },
  });

  let timedOut = false;

  try {
    await container.start();

    // Race: wait for container exit vs timeout
    const waitPromise = container.wait();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), EXECUTION_TIMEOUT_MS),
    );

    let exitCode = 1;

    try {
      const result = await Promise.race([waitPromise, timeoutPromise]);
      exitCode = (result as { StatusCode: number }).StatusCode;
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        timedOut = true;
        exitCode = 137;
        try {
          await container.kill();
        } catch {
          /* already dead */
        }
      } else {
        throw err;
      }
    }

    // Capture logs as a Buffer
    const logBuffer = (await container.logs({
      stdout: true,
      stderr: true,
      follow: false,
    })) as unknown as Buffer;

    const { stdout, stderr } = demuxBuffer(
      Buffer.isBuffer(logBuffer) ? logBuffer : Buffer.from(logBuffer),
    );

    return { stdout, stderr, exitCode, timedOut };
  } finally {
    try {
      await container.remove({ force: true });
    } catch {
      /* best effort */
    }
  }
};
