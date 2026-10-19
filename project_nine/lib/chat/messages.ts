import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { UIMessage } from "ai";
import { eq } from "drizzle-orm";

// Create a new conversation for a user
export async function loadChat(conversationId: string): Promise<UIMessage[]> {
  const messages = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(message.createdAt);

  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant",
    parts: [{ type: "text", text: message.content }],
  }));
}

// save chat to the database


export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  const conv = await db
    .select({ userId: conversation.userId })
    .from(conversation)
    .where(eq(conversation.id, chatId))
    .limit(1);

  if (conv.length === 0) {
    throw new Error("conversation not found yet...");
  }

  const existingMessages = await db
    .select({ id: message.id })
    .from(message)
    .where(eq(message.conversationId, chatId));

  const existingMessageIds = existingMessages.map((m) => m.id);

  const newMessages = messages.filter(
    (msg) => !existingMessageIds.includes(msg.id),
  );

  if (newMessages.length > 0) {
    const messageData = newMessages.map((msg) => {
      const textPart = msg.parts.find(
        (part) => part.type === "text",
      );

      const content = textPart?.text || "";

      return {
        id: msg.id,
        conversationId: chatId,
        userId: conv[0].userId,
        role: msg.role,
        content,
      };
    });

    await db.insert(message).values(messageData);
  }
    await db
    .update(conversation)
    .set({ updatedAt: new Date() })
    .where(eq(conversation.id, chatId));
}
