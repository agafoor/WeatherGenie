import { ChatLayout } from "@/components/chat/ChatLayout";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatLayout initialConversationId={conversationId} />;
}
