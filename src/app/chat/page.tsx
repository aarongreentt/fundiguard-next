'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { ConversationsList } from '@/components/chat/conversations-list';
import { useSupabaseUser } from '@/lib/hooks/use-supabase-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatPage() {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p style={{ color: COLORS['text-muted'] }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p style={{ color: COLORS['text-muted'] }}>Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS['bg-light'] }} className="min-h-screen py-8">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            variants={ANIMATIONS.slideUpIn}
            initial="initial"
            animate="animate"
            className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2"
            style={{ color: COLORS['text-dark'] }}
          >
            <MessageCircle size={32} style={{ color: COLORS['trust-green'] }} />
            Messages
          </motion.h1>
          <p style={{ color: COLORS['text-muted'] }}>
            Chat with clients and fundis about jobs and bids
          </p>
        </div>

        {/* Conversations List */}
        <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
          <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
            <CardTitle style={{ color: COLORS['text-dark'] }}>
              Your Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ConversationsList currentUserId={user.id} />
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
