"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
        <header className="mb-8 border-b border-gray-800 pb-5">
          <h1 className="text-3xl font-bold">AI Chat</h1>
          <p className="mt-2 text-sm text-gray-400">
            Powered by Next.js, OpenRouter and external tools
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300">
              Web-connected tools
            </span>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
              Weather API
            </span>
          </div>
        </header>

        <section className="flex-1 space-y-5">
          {messages.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 text-5xl">🤖</div>
              <h2 className="text-xl font-semibold">
                How can I help you today?
              </h2>
              <p className="mt-2 text-gray-400">
                Ask a question or try one of these examples.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "What's the weather in Mogadishu?",
                  "Explain how APIs work",
                  "Calculate 125 * 48",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      sendMessage({ text: suggestion });
                    }}
                    className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-blue-500 hover:bg-gray-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-800 bg-gray-900 text-gray-100"
                }`}
              >
                <p className="mb-2 text-xs font-semibold uppercase opacity-60">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </p>

                <div className="space-y-3">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p
                          key={index}
                          className="whitespace-pre-wrap break-words leading-7"
                        >
                          {part.text}
                        </p>
                      );
                    }

                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as typeof part & {
                        state?: string;
                        input?: unknown;
                        output?: unknown;
                        errorText?: string;
                      };

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-gray-700 bg-gray-950 p-3 text-sm"
                        >
                          <div className="flex items-center gap-2 font-medium text-blue-300">
                            <span>⚙️</span>
                            <span>Tool: {part.type.replace("tool-", "")}</span>
                          </div>

                          <p className="mt-2 text-gray-400">
                            {toolPart.state === "output-available"
                              ? "Tool completed successfully"
                              : toolPart.state === "output-error"
                                ? "Tool failed"
                                : "Running tool..."}
                          </p>

                          {toolPart.state === "output-available" && (
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-300">
                              {JSON.stringify(toolPart.output, null, 2)}
                            </pre>
                          )}

                          {toolPart.state === "output-error" && (
                            <p className="mt-2 text-red-400">
                              {toolPart.errorText ||
                                "The tool encountered an error."}
                            </p>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <p className="animate-pulse text-sm text-gray-400">
              AI is thinking or using a tool...
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
              Error: {error.message}
            </p>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 mt-8 bg-gray-950 pt-3"
        >
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
  );
}
