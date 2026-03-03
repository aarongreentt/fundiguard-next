'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    avatar_url?: string;
  };
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  jobTitle: string;
}

export function ChatInterface({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserAvatar,
  jobTitle,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('[ChatInterface] Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial fetch and polling
  useEffect(() => {
    console.log('[ChatInterface] 🚀 Initializing chat for conversation:', conversationId);
    fetchMessages();
    markMessagesAsRead(conversationId);

    // Poll for new messages every 2 seconds
    pollInterval.current = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(conversationId, newMessage);
      setNewMessage('');
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('[ChatInterface] Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
        <div className="p-6 text-center">
          <Loader className="animate-spin mx-auto mb-2" size={24} />
          <p style={{ color: COLORS['text-muted'] }}>Loading conversation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{ borderColor: COLORS['border-light'] }}
        >
          <div className="flex items-center gap-3">
            {otherUserAvatar && (
              <img
                src={otherUserAvatar}
                alt={otherUserName}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold" style={{ color: COLORS['text-dark'] }}>
                {otherUserName}
              </h3>
              <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
                📌 {jobTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p
              className="text-center text-sm mt-8"
              style={{ color: COLORS['text-muted'] }}
            >
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                  style={{
                    backgroundColor:
                      msg.sender_id === currentUserId
                        ? COLORS['trust-green']
                        : COLORS['bg-light'],
                  }}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className="text-xs mt-1 opacity-70"
                    style={{
                      color:
                        msg.sender_id === currentUserId ? 'rgba(255,255,255,0.7)' : COLORS['text-muted'],
                    }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mx-4 p-2 rounded text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {/* Message input */}
        <div
          className="p-4 border-t"
          style={{ borderColor: COLORS['border-light'] }}
        >
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="flex items-center gap-2"
              style={{
                backgroundColor: COLORS['trust-green'],
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
