-- Create WhatsApp Bot Flows Table
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create WhatsApp Bot States Table
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_states (
    phone_number TEXT PRIMARY KEY,
    active_flow_id UUID REFERENCES public.whatsapp_bot_flows(id) ON DELETE CASCADE,
    current_node_id TEXT NOT NULL,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.whatsapp_bot_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_bot_states ENABLE ROW LEVEL SECURITY;

-- Allow open read/write access matching other gym tables
DROP POLICY IF EXISTS "Allow open read access to whatsapp_bot_flows" ON public.whatsapp_bot_flows;
CREATE POLICY "Allow open read access to whatsapp_bot_flows" ON public.whatsapp_bot_flows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow open write access to whatsapp_bot_flows" ON public.whatsapp_bot_flows;
CREATE POLICY "Allow open write access to whatsapp_bot_flows" ON public.whatsapp_bot_flows FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow open read access to whatsapp_bot_states" ON public.whatsapp_bot_states;
CREATE POLICY "Allow open read access to whatsapp_bot_states" ON public.whatsapp_bot_states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow open write access to whatsapp_bot_states" ON public.whatsapp_bot_states;
CREATE POLICY "Allow open write access to whatsapp_bot_states" ON public.whatsapp_bot_states FOR ALL USING (true) WITH CHECK (true);
