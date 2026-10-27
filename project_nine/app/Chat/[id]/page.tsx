import { getUserConversationById, loadChat } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
import Chat from "@/components/pages/Chat";

export const instant = false;
interface pageProps {
  params: Promise<{ id: string }>;
}

export default async function chatPage({ params }: pageProps) {
  const { id } = await params;
  const session = await getUserInfo();
  if (!session) {
    redirect("/login");
  }
  const conversation = await getUserConversationById(session.user.id, id);
  if (!conversation) {
    redirect("/dashboard");
  }
  const initialMessages = await loadChat(id);
  return (
    <Chat
      initialMessages={initialMessages}
      conversationID={id}
      conversationTitle={conversation.title}
    />
  );
}
