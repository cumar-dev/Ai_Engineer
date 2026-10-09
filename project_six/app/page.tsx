"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();

      setAnswers([
        ...answers,
        { role: "user", content: prompt },
        { role: "assistant", content: data.text },
      ]);

      setPrompt("");
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col p-6">
      <h1 className="mb-6 text-3xl font-bold">Nemotron AI Chat</h1>

      <div className="flex-1 space-y-4">
        {answers.length === 0 && (
          <p className="text-gray-500">
            Hello! Ask me anything to get started.
          </p>
        )}

        {answers.map((answer, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 ${
              answer.role === "user" ? "ml-8 bg-blue-100" : "mr-8 bg-gray-100"
            }`}
          >
            <p className="mb-2 font-semibold">
              {answer.role === "user" ? "You" : "Nemotron AI"}
            </p>

            <p className="whitespace-pre-wrap break-words">{answer.content}</p>
          </div>
        ))}

        {loading && (
          <p className="animate-pulse text-gray-500">Nemotron is thinking...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          className="min-w-0 flex-1 rounded-xl border p-3"
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
