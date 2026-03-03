'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat/chat-interface';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getConversationDetails } from '@/app/actions/messages';

interface Conversation {
  id: string;
  job_id: string;
  client_id: string;
  fundi_id: string;
  created_at: string;
  job: { id: string; title: string; client_id: string } | null;
  client: { id: string; first_name: string; avatar_url: string | null } | null;
  fundi: { id: string; first_name: string; avatar_url: string | null } | null;
  currentUserId: string;
}

export default function ChatDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const data = await getConversationDetails(conversationId);
        setConversation(data);
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        setError('Conversation not found');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS['bg-light'] }} className="min-h-screen py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p style={{ color: COLORS['text-muted'] }}>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div style={{ backgroundColor: COLORS['bg-light'] }} className="min-h-screen py-6">
        <div className="max-w-2xl mx-auto px-4">
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
          <div className="text-center">
            <p style={{ color: COLORS['text-muted'] }}>
              {error || 'Conversation not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine other user info
  const isUserClient = conversation.client_id === conversation.currentUserId;
  const otherUser = isUserClient 
    ? conversation.fundi
    : conversation.client;
  const otherUserId = isUserClient ? conversation.fundi_id : conversation.client_id;
  const jobData = conversation.job;

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
          currentUserId={conversation.currentUserId}
          otherUserName={otherUser?.first_name || 'Unknown User'}
          otherUserAvatar={otherUser?.avatar_url || undefined}
          jobTitle={jobData?.title || 'Job'}
        />
      </motion.section>
    </div>
  );
}
