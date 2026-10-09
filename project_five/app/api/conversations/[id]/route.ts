import { connectDB } from "@/app/lib/mongodb";
import { Conversation } from "@/app/Model/Conversation";
import { Message } from "@/app/Model/Message";

import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const messages = await Message.find({
      conversationId: id,
    }).sort({ createdAt: 1 });

    return Response.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("GET conversation error:", error);

    return Response.json(
      { error: "Failed to get conversation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid conversation ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    await Message.deleteMany({
      conversationId: id,
    });

    await Conversation.findByIdAndDelete(id);

    return Response.json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE conversation error:", error);

    return Response.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}
