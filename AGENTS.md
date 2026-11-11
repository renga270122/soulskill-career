<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Sign-in handoff is deferred outside auth callbacks and deduplicated across hydration/events; Google initiation is single-flight so repeated taps cannot start competing login attempts.
- ATS matching is deterministic browser-side keyword coverage using shared visible resume sections and keyword-extractor stopwords; equal-weight distinct terms, explicit estimated-score limits and no resume mutations prevent misleading employer-score claims.
- Community conversations live separately from career profiles; authenticated RLS allows member reads, self-owned inserts and owner/admin deletion, keeping private career records out of discussions.
- Apply visual themes through shared CSS tokens and UI controls; keep resume document layout/fonts/colors independent so visual refreshes never alter saved presentation or exported PDFs.
- Dashboard metrics must derive from owned saved records; unavailable career features must not show fabricated counts or records.
- Resolve post-login destinations with homeForRoles: career-role users open the candidate dashboard, historical non-career-role users open their owned profile; never change saved authorization roles to choose a screen.
- Keep the retired workspace URL as a redirect-only compatibility route, with no discovery catalogue or visibility integration; published bookmarks remain usable without a retired screen.
- Keep public information pages in separate sitemap-included routes with a shared public page shell/footer; this makes trust information directly accessible without entering the private workspace.
- Roles live in `public.user_roles` (candidate/recruiter/admin); active signup always sends candidate, admin is never assigned from user metadata — prevents privilege escalation.
- Recruiter access to candidate profiles is gated by RLS on `profiles.discoverable` — consent must be enforced in the database, not the UI.
- Store private career details separately from discoverable profile names/headlines; owner RLS prevents contact details leaking to recruiters.
- Validate career and resume writes with shared Zod schemas in authenticated server functions; explicit user IDs and RLS enforce ownership.
- Use a shared measured line layout (lines plus decoration shapes) for SVG page previews and browser-generated PDFs with embedded fonts; pagination, page size and template settings stay identical and text remains selectable. DOCX export builds real Word documents from the same section data, never a renamed PDF.
- Serialize default-resume selection in a database function with an owner lock and unique index; concurrent updates cannot create two defaults.
- Keep resume presentation separate from content, with an additive design key for legacy clients; switching templates never rewrites career facts.
- Validate document signatures, byte limits and DOCX expanded sizes server-side before extraction; preserve originals in private owner-scoped storage and require editable review before creating a resume.
- Run document mapping and optional evidence-based suggestions through server-only AI Gateway helpers; no AI result is written without explicit candidate acceptance.

- Derive sitemap URLs from required route-level inclusion decisions and exclude authenticated subtrees; new public pages stay discoverable without exposing private workspaces.
- Keep private career journey entities in validated typed career records and dedicated intention/journey/task/application tables, not discoverable profiles; owner-and-candidate RLS and parent ownership keep recruiter access separate.
- Start new action plans through a serialized transactional database function that archives previous journeys; history and incomplete tasks are never discarded or automatically completed.
- Job applications link only owner resumes and open employer URLs for submission; mark submission only on explicit user confirmation, never imply an employer integration exists.
- Journal context is excluded from AI queries unless the caller explicitly approves and selects owned entries; tailored resume suggestions create a separate draft copy rather than overwrite originals.
- Invalidate authenticated navigation only for identity changes or user updates, not repeated same-user SIGNED_IN events; defer invalidation outside auth callbacks to avoid redundant gate checks and auth-lock contention.
- Career coaching renders facts from validated source IDs and exact saved text, separates goals/reflections from evidence, and labels generated actions as suggestions; the dedicated authenticated coach function never mutates profile or resume content.
- The authenticated route gate reads the local auto-refreshed session, not a network user lookup; transient network failures must not sign users out, and server functions still verify tokens.
- External job portals live in a typed config (hosts, supported filters, URL builder) separate from the UI; links open only approved official HTTPS hosts, portals are never scraped, and opening a portal never marks an application as applied.
- Access is resolved server-side from eligibility declarations and paid entitlements via security-definer functions (has_full_access, consume_ai_action); users can only read their own rows, and only the service role can activate a paid order — prevents self-granted access.
- Premium payments are one-time Razorpay orders; activation runs only after HMAC verification (checkout signature or webhook) through an idempotent, row-locked activate_paid_order function so duplicate callbacks never double-grant time. Prices/durations live in the premium_plans table.
