CREATE TABLE public.job_search_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, kind text NOT NULL CHECK (kind IN ('preferences','saved_search','history')), name text NOT NULL DEFAULT '', content jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_search_items TO authenticated; GRANT ALL ON public.job_search_items TO service_role;
ALTER TABLE public.job_search_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidate owns job search items" ON public.job_search_items FOR ALL TO authenticated USING (user_id = auth.uid() AND public.has_role(auth.uid(),'candidate')) WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(),'candidate'));
CREATE UNIQUE INDEX job_search_items_one_preferences ON public.job_search_items(user_id) WHERE kind = 'preferences';
CREATE INDEX job_search_items_owner ON public.job_search_items(user_id, kind, created_at DESC);
ALTER TABLE public.job_applications ADD COLUMN portal text NOT NULL DEFAULT '', ADD COLUMN follow_up_date date;