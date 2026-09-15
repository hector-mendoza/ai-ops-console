import { anthropic } from "@ai-sdk/anthropic";

const DEFAULT_MODEL = "claude-haiku-4-5";

export function getModel() {
  const modelId = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  return anthropic(modelId);
}

export { DEFAULT_MODEL };
