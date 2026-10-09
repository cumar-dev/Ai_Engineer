import { streamText } from "ai";
import { connectDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";
import { Conversation } from "@/app/Model/Conversation";
import { Message } from "@/app/Model/Message";
import { openRouter } from "@/app/lib/ai";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("CHAT BODY:", JSON.stringify(body, null, 2));

    const conversationId =
      typeof body.conversationId === "string" ? body.conversationId : null;

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const lastMessage = messages[messages.length - 1];

    const message =
      lastMessage?.parts
        ?.find((part: { type: string }) => part.type === "text")
        ?.text?.trim() || "";

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 5000) {
      return Response.json(
        {
          error: "Message is too long. Maximum is 5000 characters.",
        },
        { status: 400 },
      );
    }

    if (conversationId && !mongoose.Types.ObjectId.isValid(conversationId)) {
      return Response.json(
        { error: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    await connectDB();

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    } else {
      conversation = await Conversation.create({
        title: message.slice(0, 50),
      });
    }

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    const previousMessages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    const prompt = previousMessages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    const result = streamText({
      model: openRouter("nvidia/nemotron-3-ultra-550b-a55b:free"),

      system: "You are a helpful AI assistant. Answer clearly and accurately.",

      prompt,

      onFinish: async ({ text }) => {
        try {
          if (!text.trim()) {
            console.log("AI returned an empty response. Nothing to save.");
            return;
          }

          await Message.create({
            conversationId: conversation._id,
            role: "assistant",
            content: text,
          });

          await Conversation.findByIdAndUpdate(conversation._id, {
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error("Failed to save AI response:", error);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Conversation-Id": conversation._id.toString(),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);

    return Response.json(
      {
        error: "Something went wrong while processing the message.",
      },
      { status: 500 },
    );
  }
}
