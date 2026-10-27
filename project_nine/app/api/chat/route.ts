import { openRouter } from "@/lib/ai";
import { loadChat, saveChat } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
// import { UIMessage } from "@ai-sdk/react";
import {
  convertToModelMessages,
  streamText,
  validateUIMessages,
  UIMessage,
  createIdGenerator,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return Response.json(
        {
          message: "unAuthorized",
        },
        {
          status: 401,
        },
      );
    }
    const body = await req.json();
    const { messages, message: singleMessage, id: conversationId } = body;
    if (!conversationId) {
      return Response.json(
        {
          messages: "converstation ID is required",
        },
        {
          status: 400,
        },
      );
    }
    let allMessages: UIMessage[];

    if (singleMessage) {
      const previousMessages = await loadChat(conversationId);
      allMessages = [...previousMessages, singleMessage];
    } else if (messages) {
      allMessages = messages;
    } else {
      return Response.json(
        {
          error: "message is reqired",
        },
        { status: 400 },
      );
    }

    // Validate messages
    let validateMessages: UIMessage[];

    try {
      validateMessages = await validateUIMessages({
        messages: allMessages,
      });
    } catch (error) {
      console.error("Message validation failed:", error);

      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    // stream the response
    const result = streamText({
      model: openRouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
      messages: await convertToModelMessages(validateMessages),
    });

    // consume stream

    result.consumeStream();
    return result.toUIMessageStreamResponse({
        originalMessages: validateMessages,
        generateMessageId: createIdGenerator({
            prefix: "msg_",
            size: 16
        }),
        onFinish: async({messages}) => {
            try {
                await saveChat({chatId: conversationId, messages})
            } catch (error) {
                console.error("error saving chat", error);
            }
        }
    })
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
