import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { message: "Messages are required." },
        { status: 400 },
      );
    }
    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3.5-lightning:free"),
      messages,
      system: "You are a helpful AI assistant.",
      maxRetries: 1,
    });
    return NextResponse.json({
      message: "prompt created successfully...",
      text,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return Response.json(
      { error: "Failed to generate a response." },
      { status: 500 },
    );
  }
}
