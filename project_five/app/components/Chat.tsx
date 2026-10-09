"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import ConversationList from "./ConversationList";

interface LoadedMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    api: "/api/chat",
    id: conversationId ?? "new-chat",
  });

  const isBusy = status === "streaming" || status === "submitted";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isBusy) {
      return;
    }

    // Clear the field right away so it doesn't wait for the stream to finish
    setInput("");

    try {
      await sendMessage({ text }, { body: { conversationId } });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  function handleNewConversation() {
    setConversationId(null);
    setMessages([]);
    setInput("");
  }

  async function handleSelectConversation(id: string) {
    try {
      const response = await fetch(`/api/conversations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();

      const loadedMessages = data.messages.map((message: LoadedMessage) => ({
        id: message._id,
        role: message.role,
        parts: [{ type: "text", text: message.content }],
      }));

      setConversationId(id);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }

  return (
    <div className="flex h-dvh bg-white text-neutral-900 antialiased">
      <ConversationList
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200/70 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversations"
            className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <h1 className="text-[15px] font-semibold tracking-tight">
            AI Assistant
          </h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {messages.length === 0 && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  How can I help you today?
                </h2>

                <p className="mt-2 max-w-sm text-[15px] text-neutral-500">
                  Ask a question, paste some text, or start with an idea.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={
                        isUser
                          ? "max-w-[85%] rounded-3xl bg-neutral-100 px-5 py-3 sm:max-w-[75%]"
                          : "w-full max-w-full px-1"
                      }
                    >
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-7">
                        {message.parts?.map((part, index) =>
                          part.type === "text" ? (
                            <span key={index}>{part.text}</span>
                          ) : null
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}

              {status === "submitted" && (
                <div
                  className="flex items-center gap-1 px-1"
                  role="status"
                  aria-label="Assistant is thinking"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  The message didn’t go through. Check your connection and send
                  it again.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 bg-white px-4 pb-4 pt-2 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-neutral-300 bg-white py-2 pl-5 pr-2 shadow-sm transition focus-within:border-neutral-900 focus-within:shadow-md"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message AI Assistant"
              aria-label="Message"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] outline-none placeholder:text-neutral-400 disabled:opacity-60"
              disabled={isBusy}
            />

            <button
              type="submit"
              disabled={!input.trim() || isBusy}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isBusy ? (
                <span className="h-3 w-3 rounded-sm bg-current" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}