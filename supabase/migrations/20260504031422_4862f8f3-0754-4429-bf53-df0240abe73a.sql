ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed'));

UPDATE public.topics SET status = 'completed' WHERE is_completed = true;