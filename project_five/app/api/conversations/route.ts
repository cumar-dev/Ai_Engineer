import { connectDB } from "@/app/lib/mongodb";
import { Conversation } from "@/app/Model/Conversation";

export async function POST() {
  try {
    await connectDB();

    const conversation = await Conversation.create({
      title: "New Conversation",
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const conversations = await Conversation.find().sort({ updatedAt: -1 });

    return Response.json(conversations);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to get conversations" },
      { status: 500 },
    );
  }
}
