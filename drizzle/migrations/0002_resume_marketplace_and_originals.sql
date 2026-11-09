ALTER TABLE public.resumes ADD COLUMN presentation jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.resumes ADD COLUMN design_key text NOT NULL DEFAULT 'classic';
UPDATE public.resumes SET design_key = template;
COMMENT ON COLUMN public.resumes.template IS 'DEPRECATED: replaced by design_key; retained for deployed-client compatibility';
ALTER TABLE public.resumes ADD CONSTRAINT resume_design_keys CHECK (design_key IN ('classic','modern','executive','technical','minimal','contemporary','creative','graduate','projects','columns'));
ALTER TABLE public.resumes ADD CONSTRAINT presentation_size CHECK (jsonb_typeof(presentation) = 'object' AND octet_length(presentation::text) <= 10000);
CREATE TABLE public.resume_originals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 filename text NOT NULL CHECK (length(filename) BETWEEN 1 AND 255),
 path text NOT NULL CHECK (length(path) <= 300),
 size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.resume_originals TO authenticated;
GRANT ALL ON public.resume_originals TO service_role;
ALTER TABLE public.resume_originals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner original resumes" ON public.resume_originals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
ALTER TABLE public.resumes ADD COLUMN original_id uuid REFERENCES public.resume_originals(id) ON DELETE SET NULL;
CREATE POLICY "Owner original download" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resume-originals' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner original upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resume-originals' AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('pdf','docx'));
CREATE POLICY "Owner original delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resume-originals' AND (storage.foldername(name))[1] = auth.uid()::text);