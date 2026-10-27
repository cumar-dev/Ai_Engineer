import { db } from "@/db/drizzle";
import { conversation } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const createConversation = async (
  user_id: string,
  title: string = "new chat",
) => {
  const converstationId = nanoid();
  await db.insert(conversation).values({
    id: converstationId,
    title,
    userId: user_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return converstationId;
};

export const getUserConversation = async (userId: string) => {
  return db
    .select()
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.createdAt));
};
export const getAllConverstation = async () => {
  return db.select().from(conversation).orderBy(desc(conversation.createdAt));
};

export const getUserConversationById = async (
  userId: string,
  conversationId: string,
) => {
  const [result] = await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.userId, userId),
        eq(conversation.id, conversationId),
      ),
    )
    .limit(1);

  return result ?? null;
};