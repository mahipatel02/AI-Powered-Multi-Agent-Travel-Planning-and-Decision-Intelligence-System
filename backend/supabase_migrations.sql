-- SQL Migration for Travel AI Platform

-- Create Trip Memories table
CREATE TABLE IF NOT EXISTS public.trip_memories (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set Row Level Security (RLS) for trip_memories
ALTER TABLE public.trip_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to trip_memories"
ON public.trip_memories FOR SELECT
USING (true);

CREATE POLICY "Allow anonymous insert access to trip_memories"
ON public.trip_memories FOR INSERT
WITH CHECK (true);

-- Create Group Wishlist table
CREATE TABLE IF NOT EXISTS public.group_wishlist (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES public.groups(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    member_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set Row Level Security (RLS) for group_wishlist
ALTER TABLE public.group_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to group_wishlist"
ON public.group_wishlist FOR SELECT
USING (true);

CREATE POLICY "Allow anonymous insert access to group_wishlist"
ON public.group_wishlist FOR INSERT
WITH CHECK (true);

-- Optional: Add new fields for regret_scores if not using JSONB or dynamically.
-- Altering regret_scores if you are persisting crowds_score etc, though the current backend just passes it to Gemini.
