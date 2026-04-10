import { Configuration } from "openai";

export type AIProvider = "groq" | "openai";

/** Groq: free tier is usually much less strict than OpenAI trial limits. Get a key at https://console.groq.com */
const GROQ_BASE_PATH = "https://api.groq.com/openai/v1";

export function getChatAIConfiguration(): {
  configuration: Configuration;
  model: string;
  provider: AIProvider;
} {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const model =
      process.env.CHAT_MODEL?.trim() || "llama-3.1-8b-instant";
    return {
      configuration: new Configuration({
        apiKey: groqKey,
        basePath: GROQ_BASE_PATH,
      }),
      model,
      provider: "groq",
    };
  }

  const apiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPEN_AI_SECRET?.trim();
  if (!apiKey) {
    throw new Error(
      "Set GROQ_API_KEY (recommended, generous free tier) or OPENAI_API_KEY in .env"
    );
  }
  const organization =
    process.env.OPENAI_ORGANIZATION_ID?.trim() ||
    process.env.OPENAI_ORAGANIZATION_ID?.trim();

  const model = process.env.CHAT_MODEL?.trim() || "gpt-3.5-turbo";

  return {
    configuration: new Configuration({
      apiKey,
      ...(organization ? { organization } : {}),
    }),
    model,
    provider: "openai",
  };
}

/** @deprecated use getChatAIConfiguration */
export const configureOpenAI = () => getChatAIConfiguration().configuration;
