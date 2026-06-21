CREATE TABLE IF NOT EXISTS public.instagram_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    recipient_id TEXT NOT NULL,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    from_me BOOLEAN NOT NULL DEFAULT false,
    instagram_business_account_id TEXT,
    raw_event JSONB,
    mid TEXT
);

-- Enable RLS
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow all access
DROP POLICY IF EXISTS "Allow all access to instagram_messages" ON public.instagram_messages;
CREATE POLICY "Allow all access to instagram_messages" ON public.instagram_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_messages;
