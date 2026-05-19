-- Supabase SQL Schema for getImage.ai Web App
-- Create the `generations` table
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Optional: Enable Row Level Security (RLS) to allow read/insert for anonymous users
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous/public reads (so the gallery works)
CREATE POLICY "Allow public read access"
ON public.generations
FOR SELECT
USING (true);

-- Policy to allow inserts
CREATE POLICY "Allow public inserts"
ON public.generations
FOR INSERT
WITH CHECK (true);

-- Policy to allow updates (required for HQ upgrade)
CREATE POLICY "Allow public updates"
ON public.generations
FOR UPDATE
USING (true);
