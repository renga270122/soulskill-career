CREATE TABLE public.community_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 parent_id uuid REFERENCES public.community_entries(id) ON DELETE CASCADE,
 display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 60),
 title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 160),
 body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 5 AND 3000),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((parent_id IS NULL AND char_length(btrim(title)) BETWEEN 5 AND 160) OR (parent_id IS NOT NULL AND title = ''))
);
GRANT SELECT, INSERT, DELETE ON public.community_entries TO authenticated;
GRANT ALL ON public.community_entries TO service_role;
ALTER TABLE public.community_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read discussions" ON public.community_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post as themselves" ON public.community_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners and admins delete discussions" ON public.community_entries FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX community_entries_parent_created ON public.community_entries(parent_id, created_at DESC);
CREATE FUNCTION public.validate_community_reply() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.community_entries WHERE id = NEW.parent_id AND parent_id IS NULL) THEN
  RAISE EXCEPTION 'Replies must belong to a discussion';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER validate_community_reply BEFORE INSERT ON public.community_entries FOR EACH ROW EXECUTE FUNCTION public.validate_community_reply();