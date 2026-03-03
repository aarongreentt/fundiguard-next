-- Messaging system for chats between clients and fundis
-- Created: 2026-03-03

-- Conversations table - represents a chat thread between two users on a job
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fundi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint: only one conversation per client-fundi-job combo
  CONSTRAINT unique_conversation_per_job UNIQUE(job_id, client_id, fundi_id),
  
  -- Check that client and fundi are different
  CONSTRAINT different_users CHECK (client_id != fundi_id)
);

-- Messages table - individual messages in a conversation
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Check that content is not empty
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_fundi_id ON conversations(fundi_id) WHERE fundi_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id) WHERE sender_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Helper view for conversation previews
CREATE OR REPLACE VIEW conversations_with_preview AS
SELECT 
  c.id,
  c.job_id,
  c.client_id,
  c.fundi_id,
  c.created_at,
  c.updated_at,
  j.title AS job_title,
  cp.first_name AS client_name,
  cp.avatar_url AS client_avatar,
  fp.first_name AS fundi_name,
  fp.avatar_url AS fundi_avatar,
  (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
  (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
  (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = FALSE) AS unread_count
FROM conversations c
LEFT JOIN jobs j ON c.job_id = j.id
LEFT JOIN profiles cp ON c.client_id = cp.id
LEFT JOIN profiles fp ON c.fundi_id = fp.id;

-- Row Level Security Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "conversations_view_own" ON conversations;
DROP POLICY IF EXISTS "conversations_create_own" ON conversations;
DROP POLICY IF EXISTS "messages_view_own" ON messages;
DROP POLICY IF EXISTS "messages_create_own" ON messages;
DROP POLICY IF EXISTS "messages_update_read_status" ON messages;

-- Conversations: Users can see conversations they're part of
CREATE POLICY "conversations_view_own" ON conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = fundi_id);

CREATE POLICY "conversations_create_own" ON conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = fundi_id);

-- Messages: Users can see messages in their conversations
CREATE POLICY "messages_view_own" ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE auth.uid() = client_id OR auth.uid() = fundi_id
    )
  );

CREATE POLICY "messages_create_own" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND conversation_id IN (
    SELECT id FROM conversations 
    WHERE auth.uid() = client_id OR auth.uid() = fundi_id
  ));

-- Mark own messages as read (for notifications)
CREATE POLICY "messages_update_read_status" ON messages FOR UPDATE
  USING (true)
  WITH CHECK (auth.uid() IN (
    SELECT client_id FROM conversations WHERE id = conversation_id
    UNION
    SELECT fundi_id FROM conversations WHERE id = conversation_id
  ));

-- Comments documenting the messaging system
COMMENT ON TABLE conversations IS 'Stores conversation threads between clients and fundis on specific jobs';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN conversations.job_id IS 'The job this conversation is about';
COMMENT ON COLUMN conversations.client_id IS 'The client who posted the job';
COMMENT ON COLUMN conversations.fundi_id IS 'The fundi/pro who is bidding on the job';
COMMENT ON COLUMN messages.is_read IS 'Tracks if message has been read by recipient';
