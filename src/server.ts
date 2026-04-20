import express, { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const client = new Anthropic();

// Load markdown docs once at startup
const MARKDOWN_DIR = path.join(__dirname, "..", "markdown");
const pricingDoc = fs.readFileSync(
  path.join(MARKDOWN_DIR, "pricing-public.md"),
  "utf-8"
);
const modelsDoc = fs.readFileSync(
  path.join(MARKDOWN_DIR, "models.md"),
  "utf-8"
);

const SYSTEM_PROMPT = `You are an AssemblyAI support assistant. Answer questions about AssemblyAI pricing, models, and usage based strictly on the reference documentation provided. Be accurate and concise. If information is not in the docs, say so.`;

// The docs are stable across requests — cache them at the message level
const CONTEXT_MESSAGES: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: [
      {
        type: "text",
        text: `Here is the authoritative AssemblyAI pricing reference:\n\n${pricingDoc}\n\nHere is the authoritative AssemblyAI models reference:\n\n${modelsDoc}`,
        cache_control: { type: "ephemeral" },
      },
    ],
  },
  {
    role: "assistant",
    content:
      "I have the authoritative AssemblyAI pricing and models documentation. I'll answer questions based strictly on this reference material.",
  },
];

interface UsageRequest {
  query: string;
}

interface UsageResponse {
  answer: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
}

app.post("/usage", async (req: Request, res: Response) => {
  const { query } = req.body as UsageRequest;

  if (!query || typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ error: "query is required" });
    return;
  }

  const messages: Anthropic.MessageParam[] = [
    ...CONTEXT_MESSAGES,
    { role: "user", content: query.trim() },
  ];

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages,
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find((b) => b.type === "text");
  const answer = textBlock?.type === "text" ? textBlock.text : "";

  const result: UsageResponse = {
    answer,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens:
        response.usage.cache_creation_input_tokens ?? 0,
    },
  };

  res.json(result);
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
