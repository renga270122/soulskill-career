CREATE TABLE public.premium_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_paise integer NOT NULL CHECK (price_paise > 0),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  badge text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.premium_plans TO anon, authenticated;
GRANT ALL ON public.premium_plans TO service_role;
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active plans" ON public.premium_plans FOR SELECT TO anon, authenticated USING (active);
INSERT INTO public.premium_plans (id, name, price_paise, duration_days, badge, sort_order) VALUES
 ('monthly','Monthly',9900,30,NULL,1),
 ('quarterly','Quarterly',29900,90,NULL,2),
 ('half_yearly','Half-yearly',49900,180,'Popular',3),
 ('annual','Annual',69900,365,'Best Value',4);

CREATE TABLE public.eligibility_declarations (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fresh_graduate','first_time_job_seeker','layoff_affected')),
  declared boolean NOT NULL DEFAULT true,
  declared_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
GRANT SELECT ON public.eligibility_declarations TO authenticated;
GRANT ALL ON public.eligibility_declarations TO service_role;
ALTER TABLE public.eligibility_declarations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own eligibility readable" ON public.eligibility_declarations FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.premium_plans(id),
  plan_name text NOT NULL,
  duration_days integer NOT NULL,
  amount_paise integer NOT NULL,
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text UNIQUE,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT SELECT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payments readable" ON public.payment_orders FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.premium_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid NOT NULL UNIQUE REFERENCES public.payment_orders(id),
  plan_name text NOT NULL,
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_entitlements TO authenticated;
GRANT ALL ON public.premium_entitlements TO service_role;
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own entitlements readable" ON public.premium_entitlements FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.ai_usage (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  used integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own AI usage readable" ON public.ai_usage FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.declare_eligibility(_category text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _category NOT IN ('fresh_graduate','first_time_job_seeker','layoff_affected') THEN RAISE EXCEPTION 'Invalid category'; END IF;
  INSERT INTO eligibility_declarations (user_id, category, declared, declared_at, expires_at)
  VALUES (auth.uid(), _category, true, now(), now() + interval '180 days')
  ON CONFLICT (user_id) DO UPDATE SET category = EXCLUDED.category, declared = true,
    declared_at = now(),
    expires_at = CASE WHEN eligibility_declarations.declared AND eligibility_declarations.expires_at > now() THEN eligibility_declarations.expires_at ELSE now() + interval '180 days' END;
END $$;
REVOKE ALL ON FUNCTION public.declare_eligibility(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.declare_eligibility(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.withdraw_eligibility()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE eligibility_declarations SET declared = false, declared_at = now() WHERE user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.withdraw_eligibility() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.withdraw_eligibility() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_full_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM eligibility_declarations WHERE user_id = _user_id AND declared AND expires_at > now())
      OR EXISTS (SELECT 1 FROM premium_entitlements WHERE user_id = _user_id AND starts_at <= now() AND expires_at > now());
$$;
REVOKE ALL ON FUNCTION public.has_full_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_full_access(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consume_ai_action(_limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM'); n integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT public.has_full_access(auth.uid()) THEN RAISE EXCEPTION 'PREMIUM_REQUIRED'; END IF;
  INSERT INTO ai_usage (user_id, month, used) VALUES (auth.uid(), m, 1)
  ON CONFLICT (user_id, month) DO UPDATE SET used = ai_usage.used + 1 WHERE ai_usage.used < LEAST(_limit, 50)
  RETURNING used INTO n;
  IF n IS NULL THEN RAISE EXCEPTION 'AI_LIMIT_REACHED'; END IF;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.consume_ai_action(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_action(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.activate_paid_order(_razorpay_order_id text, _razorpay_payment_id text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o payment_orders%ROWTYPE; start_at timestamptz; ent uuid;
BEGIN
  SELECT * INTO o FROM payment_orders WHERE razorpay_order_id = _razorpay_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF o.status = 'paid' THEN
    SELECT id INTO ent FROM premium_entitlements WHERE order_id = o.id; RETURN ent;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(o.user_id::text));
  SELECT GREATEST(now(), COALESCE(MAX(expires_at), now())) INTO start_at FROM premium_entitlements WHERE user_id = o.user_id;
  UPDATE payment_orders SET status = 'paid', razorpay_payment_id = _razorpay_payment_id, paid_at = now() WHERE id = o.id;
  INSERT INTO premium_entitlements (user_id, order_id, plan_name, starts_at, expires_at)
  VALUES (o.user_id, o.id, o.plan_name, start_at, start_at + make_interval(days => o.duration_days)) RETURNING id INTO ent;
  RETURN ent;
END $$;
REVOKE ALL ON FUNCTION public.activate_paid_order(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_order(text, text) TO service_role;