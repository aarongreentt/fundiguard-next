'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { ConversationsList } from '@/components/chat/conversations-list';
import { NewConversationModal } from '@/components/chat/new-conversation-modal';
import { useSupabaseUser } from '@/lib/hooks/use-supabase-user';
import { useSupabaseProfile } from '@/lib/hooks/use-supabase-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getJobsWithBiddersForClient, getJobsWithBidsForFundi } from '@/app/actions/messages';

export default function ChatPage() {
  const { user, loading } = useSupabaseUser();
  const { profile } = useSupabaseProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    setIsLoadingJobs(true);
    const fetchJobs = async () => {
      try {
        if (profile.role === 'client') {
          const data = await getJobsWithBiddersForClient(user.id);
          setJobs(data || []);
        } else {
          const data = await getJobsWithBidsForFundi(user.id);
          setJobs(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user, profile]);

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
        {/* Header with New Conversation Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
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
          <Button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: COLORS['trust-green'],
              color: 'white',
            }}
            className="flex items-center gap-2"
            disabled={isLoadingJobs}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
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

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobs={jobs}
        userRole={profile?.role as 'client' | 'fundi'}
      />
    </div>
  );
}
