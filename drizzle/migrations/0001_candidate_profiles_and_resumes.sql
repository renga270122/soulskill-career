CREATE TABLE public.candidate_details (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 content jsonb NOT NULL DEFAULT '{}'::jsonb,
 photo_path text,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT candidate_content_object CHECK (jsonb_typeof(content) = 'object' AND octet_length(content::text) <= 500000)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_details TO authenticated;
GRANT ALL ON public.candidate_details TO service_role;
ALTER TABLE public.candidate_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner candidate details" ON public.candidate_details FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TABLE public.resumes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 title text NOT NULL DEFAULT 'Untitled resume' CHECK (length(title) BETWEEN 1 AND 200),
 target_role text NOT NULL DEFAULT '' CHECK (length(target_role) <= 200),
 template text NOT NULL DEFAULT 'classic' CHECK (template IN ('classic', 'modern', 'executive')),
 content jsonb NOT NULL DEFAULT '{}'::jsonb,
 is_default boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT resume_content_object CHECK (jsonb_typeof(content) = 'object' AND octet_length(content::text) <= 500000)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX one_default_resume ON public.resumes(user_id) WHERE is_default;
CREATE INDEX resumes_owner ON public.resumes(user_id);
CREATE FUNCTION public.set_default_resume(resume_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 PERFORM 1 FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_id AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Resume not found'; END IF;
 UPDATE public.resumes SET is_default = false WHERE user_id = auth.uid() AND is_default;
 UPDATE public.resumes SET is_default = true WHERE id = resume_id AND user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.set_default_resume(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_default_resume(uuid) TO authenticated;
CREATE POLICY "Owner asset read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'candidate-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner asset upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'candidate-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp'));
CREATE POLICY "Owner asset delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'candidate-assets' AND (storage.foldername(name))[1] = auth.uid()::text);