import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
    const {messages}: {messages: UIMessage[]} = await req.json();
    const result = streamText({
        model: openrouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
        messages: await convertToModelMessages(messages)
    })
    return result.toUIMessageStreamResponse();
}