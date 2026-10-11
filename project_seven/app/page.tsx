"use client";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();
  const isLoading = status === "submitted" || status === "streaming";
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };
  return (
    <>
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
          <header className="mb-8 border-b border-gray-800 pb-5">
            <h1 className="text-3xl font-bold">AI Chat</h1>
            <p className="mt-2 text-sm text-gray-400">
              Powered by Next.js, AI SDK and OpenRouter
            </p>
          </header>

          <section className="flex-1 space-y-5">
            {messages.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 text-5xl">🤖</div>
                <h2 className="text-xl font-semibold">
                  How can I help you today?
                </h2>
                <p className="mt-2 text-gray-400">
                  Ask me anything to get started.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-800 bg-gray-900 text-gray-100"
                  }`}
                >
                  <p className="mb-2 text-xs font-semibold uppercase opacity-60">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </p>

                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <p
                        key={index}
                        className="whitespace-pre-wrap break-words leading-7"
                      >
                        {part.text}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-sm text-gray-400">AI is thinking...</div>
            )}

            {error && (
              <p className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
                Error: {error.message}
              </p>
            )}
          </section>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-700 bg-gray-900 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your AI..."
                rows={1}
                disabled={isLoading}
                className="max-h-40 min-h-12 flex-1 resize-y bg-transparent p-3 text-sm outline-none placeholder:text-gray-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
