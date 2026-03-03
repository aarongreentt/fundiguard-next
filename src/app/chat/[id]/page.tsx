import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat/chat-interface';
import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id: conversationId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Get conversation details
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      job_id,
      client_id,
      fundi_id,
      created_at,
      job:jobs(id, title, client_id),
      client:profiles!client_id(id, first_name, avatar_url),
      fundi:profiles!fundi_id(id, first_name, avatar_url)
    `
    )
    .eq('id', conversationId)
    .or(`client_id.eq.${user.id},fundi_id.eq.${user.id}`)
    .single();

  if (error || !conversation) {
    console.error('Conversation not found:', error);
    return notFound();
  }

  // Determine other user info
  const isUserClient = conversation.client_id === user.id;
  const otherUser = isUserClient 
    ? (Array.isArray(conversation.fundi) ? conversation.fundi[0] : conversation.fundi)
    : (Array.isArray(conversation.client) ? conversation.client[0] : conversation.client);
  const otherUserId = isUserClient ? conversation.fundi_id : conversation.client_id;
  const jobData = Array.isArray(conversation.job) ? conversation.job[0] : conversation.job;

  return (
    <div style={{ backgroundColor: COLORS['bg-light'] }} className="min-h-screen py-6">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-4"
      >
        {/* Back button */}
        <Link href="/chat">
          <Button
            variant="ghost"
            className="mb-4 flex items-center gap-2"
            style={{ color: COLORS['trust-green'] }}
          >
            <ArrowLeft size={20} />
            Back to Messages
          </Button>
        </Link>

        {/* Chat Interface */}
        <ChatInterface
          conversationId={conversationId}
          currentUserId={user.id}
          otherUserName={otherUser?.first_name || 'Unknown User'}
          otherUserAvatar={otherUser?.avatar_url || undefined}
          jobTitle={jobData?.title || 'Job'}
        />
      </motion.section>
    </div>
  );
}
