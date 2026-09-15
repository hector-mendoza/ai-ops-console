"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { AnswerStream } from "@/components/AnswerStream";
import { ClaimBanner } from "@/components/ClaimBanner";
import { Composer } from "@/components/Composer";
import { StatusBoard } from "@/components/StatusBoard";
import { ToolTrail } from "@/components/ToolTrail";
import {
  extractAnswerText,
  partsToToolSteps,
  toolStepsToBoardRows,
  uiMessagesToChatMessages,
} from "@/lib/chat/ui";

const SAMPLE_ASKS = [
  "Sync downtown venues and push to the ops status board",
  "Sync coastal-resorts and notify partner-events-hub",
  "Run a dry sync for metro-nightlife and hit the analytics pipeline",
];

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: uiMessages }) => ({
        body: {
          messages: uiMessagesToChatMessages(uiMessages),
        },
      }),
    }),
  });

  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const toolSteps = useMemo(
    () => (latestAssistant ? partsToToolSteps(latestAssistant.parts) : []),
    [latestAssistant],
  );
  const boardRows = useMemo(() => toolStepsToBoardRows(toolSteps), [toolSteps]);
  const answerText = latestAssistant ? extractAnswerText(latestAssistant.parts) : "";
  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <ClaimBanner />

      <Composer
        disabled={isStreaming}
        onChange={setInput}
        onSubmit={() => {
          const text = input.trim();
          if (!text) return;
          sendMessage({ text });
          setInput("");
        }}
        value={input}
      />

      <div className="flex flex-wrap gap-2">
        {SAMPLE_ASKS.map((ask) => (
          <button
            key={ask}
            className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-emerald-500/50 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isStreaming}
            onClick={() => sendMessage({ text: ask })}
            type="button"
          >
            {ask}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolTrail steps={toolSteps} />
        <StatusBoard rows={boardRows} />
      </div>

      <AnswerStream isStreaming={isStreaming} text={answerText} />
    </main>
  );
}
