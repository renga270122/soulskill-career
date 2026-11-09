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
- Roles live in `public.user_roles` (candidate/recruiter/admin); signup may self-select only candidate or recruiter, admin is never assigned from user metadata — prevents privilege escalation.
- Recruiter access to candidate profiles is gated by RLS on `profiles.discoverable` — consent must be enforced in the database, not the UI.
- Any sample figures in the UI must carry the "Demo data" badge — the brief forbids implying unbuilt features work.
- Store private career details separately from discoverable profile names/headlines; owner RLS prevents contact details leaking to recruiters.
- Validate career and resume writes with shared Zod schemas in authenticated server functions; explicit user IDs and RLS enforce ownership.
- Use a shared measured line layout for SVG page previews and browser-generated PDFs with embedded fonts; pagination and template settings stay identical and text remains selectable.
- Serialize default-resume selection in a database function with an owner lock and unique index; concurrent updates cannot create two defaults.
- Keep resume presentation separate from content, with an additive design key for legacy clients; switching templates never rewrites career facts.
- Validate document signatures, byte limits and DOCX expanded sizes server-side before extraction; preserve originals in private owner-scoped storage and require editable review before creating a resume.
- Run document mapping and optional evidence-based suggestions through server-only AI Gateway helpers; no AI result is written without explicit candidate acceptance.

- Derive sitemap URLs from required route-level inclusion decisions and exclude authenticated subtrees; new public pages stay discoverable without exposing private workspaces.
- Keep private career journey entities in validated typed career records and dedicated intention/journey/task/application tables, not discoverable profiles; owner-and-candidate RLS and parent ownership keep recruiter access separate.
- Start new action plans through a serialized transactional database function that archives previous journeys; history and incomplete tasks are never discarded or automatically completed.
- Job applications link only owner resumes and open employer URLs for submission; mark submission only on explicit user confirmation, never imply an employer integration exists.
- Journal context is excluded from AI queries unless the caller explicitly approves and selects owned entries; tailored resume suggestions create a separate draft copy rather than overwrite originals.
