"use client";
import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage: Message = { role: "user", content: prompt };
    const history = [...answers, userMessage];

    setAnswers(history);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      setAnswers([...history, { role: "assistant", content: data.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setAnswers([
        ...history,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <main className="mx-auto flex h-screen max-w-3xl flex-col px-4 sm:px-6">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-neutral-200 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-sm font-semibold text-white">
            N
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              Nemotron AI Chat
            </h1>
            <p className="text-xs text-neutral-500">
              Ask anything, get a clear answer
            </p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto py-8">
          {answers.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg font-semibold shadow-sm">
                N
              </div>
              <h2 className="text-xl font-semibold">How can I help you today?</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Type a message below to get started.
              </p>
            </div>
          )}

          {answers.map((answer, index) => {
            const isUser = answer.role === "user";
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
                  <p className="mb-1 px-1 text-xs font-medium text-neutral-500">
                    {isUser ? "You" : "Nemotron AI"}
                  </p>
                  <div
                    className={`rounded-2xl px-4 py-3 text-left text-sm leading-relaxed ${
                      isUser
                        ? "rounded-tr-sm bg-neutral-900 text-white"
                        : "rounded-tl-sm border border-neutral-200 bg-white text-neutral-800 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {answer.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div>
                <p className="mb-1 px-1 text-xs font-medium text-neutral-500">
                  Nemotron AI
                </p>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-4 py-4 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="pb-6 pt-2">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm transition focus-within:border-neutral-400 focus-within:shadow-md"
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything..."
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400"
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-neutral-400">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </main>
    </div>
  );
}