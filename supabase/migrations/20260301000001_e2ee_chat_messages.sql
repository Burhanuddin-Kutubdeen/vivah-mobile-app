-- ==============================================================================
-- MIGRATION: E2EE CHAT MESSAGES, USER PUBLIC KEYS & CONVERSATION PARTICIPANT RLS
-- ==============================================================================

-- 1. Table for User X25519 Public Keys
CREATE TABLE IF NOT EXISTS public.user_public_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index messages on (conversation_id, created_at) for fast paginated queries
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY, -- Client-generated UUID idempotency key
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ciphertext TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON public.messages(conversation_id, created_at DESC);

-- 3. Row Level Security Policies (Only conversation participants can read or insert)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_public_keys ENABLE ROW LEVEL SECURITY;

-- Public key policy
CREATE POLICY "Public keys readable by all authenticated users"
ON public.user_public_keys FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert/update own public key"
ON public.user_public_keys FOR ALL
USING (auth.uid() = user_id);

-- Helper function: Is user a participant in conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conv_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );
END;
$$;

-- Messages policy: Only conversation participants can READ or INSERT
DROP POLICY IF EXISTS "Participants can read messages" ON public.messages;
CREATE POLICY "Participants can read messages"
ON public.messages FOR SELECT
USING (public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND public.is_conversation_participant(conversation_id)
);

-- ==============================================================================
-- E2EE TEST PLAN & SERVER METADATA VISIBILITY DOCUMENTATION
-- ==============================================================================

/*
TEST PLAN FOR E2EE CHAT:
1. Key Generation Test: Log in with User A -> Verify X25519 private key is saved in flutter_secure_storage and public key is uploaded to user_public_keys.
2. Encryption Test: User A sends "Hello" to User B -> Verify database stores ciphertext base64 string and random nonce, NOT raw plaintext.
3. Decryption Test: User B opens conversation -> Verify ECDH shared secret is derived and message "Hello" is decrypted cleanly.
4. RLS Participant Isolation Test: User C (non-participant) attempts SELECT * FROM messages WHERE conversation_id = '...' -> Verify zero rows returned due to RLS policy.
5. Key Loss Test: Simulate new device/reinstall by clearing local secure storage -> Verify KeyRecoveryNoticeScreen is shown with options to restore or start fresh.

SERVER METADATA VISIBILITY & LIMITS:
- Server Visible Metadata:
  * Conversation participants (who talks to whom: participant1_id, participant2_id).
  * Timestamps of messages (created_at).
  * Volume and frequency of messages.
  * Ciphertext length and nonce string.
- Hidden from Server:
  * Message text content and attached media (encrypted on device with AES-256-GCM using derived ECDH shared key).
- Limits:
  * Private keys are local-only; if a user loses their private key and hasn't backed up their passphrase, historical messages cannot be recovered.
*/
