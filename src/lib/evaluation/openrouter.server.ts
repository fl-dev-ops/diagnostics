import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject, generateText, type FilePart, type UserContent } from "ai";
import type { ZodType } from "zod";

export const EVALUATION_MODEL_ID = "google/gemini-2.5-flash";

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return apiKey;
}

function getEvaluationModel() {
  const provider = createOpenRouter({
    apiKey: getOpenRouterApiKey(),
  });

  return provider(EVALUATION_MODEL_ID, {
    plugins: [{ id: "response-healing" }],
  });
}

export function buildRemoteFilePart(input: {
  url: string;
  mediaType: string;
  filename?: string;
}): FilePart {
  try {
    return {
      type: "file",
      data: new URL(input.url),
      mediaType: input.mediaType,
      filename: input.filename,
    };
  } catch {
    throw new Error(`Invalid file URL: ${input.url}`);
  }
}

export async function generateEvaluationText(input: {
  userContent: UserContent;
  temperature?: number;
}) {
  const result = await generateText({
    model: getEvaluationModel(),
    temperature: input.temperature ?? 0,
    messages: [
      {
        role: "user",
        content: input.userContent,
      },
    ],
  });

  return result;
}

export async function generateEvaluationObject<TSchema extends ZodType>({
  schema,
  userContent,
  temperature,
}: {
  schema: TSchema;
  userContent: UserContent;
  temperature?: number;
}) {
  const result = await generateObject({
    model: getEvaluationModel(),
    schema,
    temperature: temperature ?? 0,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  return result;
}
