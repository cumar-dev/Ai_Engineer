"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bot,
  Send,
  User,
  Square,
  ArrowDown,
  LoaderCircle,
  Copy,
  Check,
  RotateCcw,
  Code2,
  Lightbulb,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";

interface ChatProps {
  initialMessages: UIMessage[];
  conversationTitle: string;
  conversationID?: string;
}

const SUGGESTIONS = [
  {
    icon: Code2,
    title: "Debug my code",
    prompt: "Help me debug a problem in my code. What do you need from me?",
  },
  {
    icon: Lightbulb,
    title: "Explain a concept",
    prompt: "Explain how React Server Components work in simple terms.",
  },
  {
    icon: PenLine,
    title: "Write something",
    prompt: "Help me write a clear, friendly email to a client about a project delay.",
  },
  {
    icon: Sparkles,
    title: "Brainstorm ideas",
    prompt: "Give me 5 creative side project ideas for a full-stack web developer.",
  },
];

function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join("\n\n");
}

export default function Chat({
  initialMessages = [],
  conversationID,
  conversationTitle = "New conversation",
}: ChatProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, regenerate, status, stop, error } = useChat({
    id: conversationID,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            id,
          },
        };
      },
    }),
  });

  // Redirect unauthenticated users after rendering.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Detect whether the user is near the latest message.
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setIsAtBottom(distanceFromBottom < 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Follow new messages only when the user is already at the bottom.
  useEffect(() => {
    if (!isAtBottom) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, status, isAtBottom]);

  // Put the cursor back in the input once a reply has finished.
  useEffect(() => {
    if (status === "ready") {
      inputRef.current?.focus();
    }
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = input.trim();

    if (!text || status !== "ready") return;

    sendMessage({ text });
    setInput("");
    setIsAtBottom(true);
  }

  function handleSuggestion(prompt: string) {
    if (status !== "ready") return;

    sendMessage({ text: prompt });
    setIsAtBottom(true);
  }

  async function handleCopy(message: UIMessage) {
    try {
      await navigator.clipboard.writeText(getMessageText(message));
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard can be blocked by the browser; fail silently.
    }
  }

  function handleRegenerate() {
    if (status !== "ready") return;

    regenerate();
    setIsAtBottom(true);
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-emerald-500" />
        <p className="text-sm text-gray-500">Loading your chat...</p>
      </div>
    );
  }

  const lastMessageId = messages[messages.length - 1]?.id;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="z-10 shrink-0 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-emerald-500 text-white">
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                {conversationTitle || "AI Chat"}
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI Assistant
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="shrink-0 border-gray-200 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Scrollable messages */}
      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
      >
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8 sm:px-6 sm:py-8">
          {messages.length === 0 && (
            <div className="flex min-h-[50vh] animate-in flex-col items-center justify-center text-center duration-500 fade-in slide-in-from-bottom-2">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100">
                <Bot className="h-9 w-9 text-emerald-600" />
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                What can I help with?
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Ask a question, explore an idea, or get help with your code.
              </p>

              {/* Suggested prompts */}
              <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSuggestion(prompt)}
                    disabled={status !== "ready"}
                    className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900">
                        {title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-gray-500">
                        {prompt}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";
            const isLast = message.id === lastMessageId;
            const hasText = message.parts.some(
              (part) => part.type === "text" && part.text.trim().length > 0
            );
            const showActions =
              !isUser && hasText && !(isLast && isLoading);
            const copied = copiedId === message.id;

            return (
              <div
                key={message.id}
                className={`group flex animate-in gap-3 duration-300 fade-in slide-in-from-bottom-2 sm:gap-4 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <Avatar className="mt-1 h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-emerald-100">
                      <Bot className="h-4 w-4 text-emerald-600" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${
                    isUser
                      ? "rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3 text-white shadow-sm"
                      : "min-w-0 flex-1 pt-1 text-gray-800"
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type !== "text") return null;

                    if (isUser) {
                      return (
                        <p
                          key={i}
                          className="whitespace-pre-wrap break-words text-sm leading-7"
                        >
                          {part.text}
                        </p>
                      );
                    }

                    return (
                      <Streamdown
                        key={i}
                        className="prose prose-sm max-w-none min-w-0 break-words prose-headings:font-semibold prose-headings:text-gray-900 prose-p:leading-7 prose-p:text-gray-800 prose-strong:text-gray-900 prose-a:text-emerald-600 prose-pre:m-0 prose-pre:rounded-none prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 [&_[data-streamdown=code-block]_code]:before:content-none [&_[data-streamdown=code-block]_code]:after:content-none"
                        plugins={{ code, mermaid, math, cjk }}
                        isAnimating={status === "streaming" && isLast}
                        parseIncompleteMarkdown
                      >
                        {part.text}
                      </Streamdown>
                    );
                  })}

                  {/* Message actions (appear on hover, always visible on touch) */}
                  {showActions && (
                    <div className="mt-2 flex items-center gap-1 transition-opacity duration-200 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleCopy(message)}
                        aria-label={copied ? "Copied" : "Copy message"}
                        title={copied ? "Copied" : "Copy message"}
                        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {isLast && status === "ready" && (
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          aria-label="Regenerate response"
                          title="Regenerate response"
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <Avatar className="mt-1 h-8 w-8 shrink-0">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex animate-in items-center gap-3 text-sm text-gray-500 duration-300 fade-in slide-in-from-bottom-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-emerald-100">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </AvatarFallback>
              </Avatar>
              <LoaderCircle className="h-4 w-4 animate-spin text-emerald-500" />
              <span>Thinking...</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="animate-in rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 duration-300 fade-in slide-in-from-bottom-2"
            >
              {error.message || "Something went wrong. Please try again."}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating button to return to the latest message */}
        {!isAtBottom && messages.length > 0 && (
          <div className="pointer-events-none sticky bottom-4 z-10 -mt-12 flex justify-end px-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={scrollToBottom}
              aria-label="Scroll to latest message"
              title="Scroll to latest message"
              className="pointer-events-auto animate-in rounded-full border-gray-200 bg-white shadow-lg duration-200 fade-in zoom-in-90 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Fixed-bottom composer */}
      <footer className="z-10 shrink-0 border-t border-gray-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4">
        <form className="mx-auto max-w-3xl" onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all focus-within:border-emerald-400 focus-within:shadow-md focus-within:ring-4 focus-within:ring-emerald-500/10">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="Message your AI..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              disabled={isLoading}
              aria-label="Write your message"
              className="max-h-40 min-w-0 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60"
            />

            {isLoading ? (
              <Button
                type="button"
                size="icon"
                onClick={() => stop()}
                aria-label="Stop generating"
                title="Stop generating"
                className="shrink-0 rounded-xl bg-gray-900 text-white transition hover:bg-gray-700 active:scale-95"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                aria-label="Send message"
                title="Send message"
                className="shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="py-2 text-center text-[11px] text-gray-400">
            AI can make mistakes. Check important information.
          </p>
        </form>
      </footer>
    </div>
  );
}