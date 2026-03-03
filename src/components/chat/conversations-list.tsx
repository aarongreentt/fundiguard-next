'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Loader } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface Conversation {
  id: string;
  job_id: string;
  client_id: string;
  fundi_id: string;
  created_at: string;
  updated_at: string;
  job_title: string;
  client_name: string;
  client_avatar: string;
  fundi_name: string;
  fundi_avatar: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationsListProps {
  currentUserId: string;
}

export function ConversationsList({ currentUserId }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log('[ConversationsList] 📬 Fetching conversations...');
        const response = await fetch('/api/messages/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        setConversations(data);
        setError(null);
      } catch (err) {
        console.error('[ConversationsList] Error:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Loader className="animate-spin mx-auto mb-2" size={24} />
        <p style={{ color: COLORS['text-muted'] }}>Loading conversations...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 p-4 rounded-lg"
        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
      >
        ❌ {error}
      </motion.div>
    );
  }

  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <MessageCircle size={40} style={{ color: COLORS['text-muted'] }} className="mx-auto mb-2" />
        <p style={{ color: COLORS['text-muted'] }}>No conversations yet</p>
        <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
          When you place a bid or receive one, conversations will appear here
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {conversations.map((conv) => {
        const otherUser = conv.client_id === currentUserId ? conv.fundi_name : conv.client_name;
        const otherAvatar =
          conv.client_id === currentUserId ? conv.fundi_avatar : conv.client_avatar;

        return (
          <motion.div key={conv.id} variants={ANIMATIONS.itemVariants}>
            <Link href={`/chat/${conv.id}`}>
              <div
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  {otherAvatar && (
                    <img
                      src={otherAvatar}
                      alt={otherUser}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: COLORS['text-dark'] }}
                        >
                          {otherUser}
                        </h3>
                        <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                          📌 {conv.job_title}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {conv.unread_count > 0 && (
                        <div
                          className="px-2 py-1 rounded-full text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: COLORS['trust-green'] }}
                        >
                          {conv.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Last message preview */}
                    <p
                      className="text-xs mt-2 truncate"
                      style={{ color: COLORS['text-muted'] }}
                    >
                      {conv.last_message || 'No messages yet'}
                    </p>

                    {/* Time */}
                    <p className="text-xs mt-1" style={{ color: COLORS['text-muted'] }}>
                      {conv.last_message_time
                        ? new Date(conv.last_message_time).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : new Date(conv.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
