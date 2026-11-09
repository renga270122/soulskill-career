CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('feedback','bug')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  page text CHECK (page IS NULL OR char_length(page) <= 200),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send feedback" ON public.feedback FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admins read feedback" ON public.feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));