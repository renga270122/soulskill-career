# SoulSkill 2.0 — Career transformation

## Goal
Evolve the existing SoulSkill application into a cohesive, inspiration-led career workspace: **“Manifest your career. Build your future.”** Mindset activities will connect to practical actions and factual progress, never promises of employment or fabricated achievements.

Preserve existing accounts, candidate/recruiter roles, domain settings, private storage, and every working Resume Studio feature. Keep recruiter navigation separate and unchanged. Google and email/password remain enabled; Lovable will not return as a login choice. **GitHub login is not supported by Lovable Cloud and cannot be included.**

## Milestone 1 — Intention and journey foundation
- Add the five-step candidate welcome, career intention, future identity, editable affirmation and daily commitment onboarding.
- Save drafts and completed responses; allow revisiting and editing without discarding history.
- Add **My Career Journey** with the target role, intention, daily affirmation, journey stage, actual progress, future identity, weekly actions, default-resume readiness and reflection entry point.
- Replace sample candidate-dashboard achievements with real profile/resume counts and honest empty states; retain its useful existing links. Do not change the recruiter dashboard.
- Add the first candidate navigation links and navy/ivory/gold styling scoped to the new career experience, preserving typography and Resume Studio presentation settings.
- Verify authenticated saving, refresh/reload, editing, candidate access and phone/desktop layouts before continuing.

## Milestone 2 — Private vision and reflection
- Add a Career Vision Board with text/image cards, the requested career categories, starter layouts, editing, accessible reordering, deletion and full-screen presentation.
- Store images privately under the owner’s account; validate formats and limits and clean up removed images.
- Add the Affirmation Center: custom/favorite affirmations, daily completion and history.
- Add searchable daily/weekly journal entries with the supplied prompts, editing, deletion and export; surface weekly reflections in the journey dashboard.
- Verify persistence, private image access, daily completion deduplication and owner-only journal access.

## Milestone 3 — Practical action and daily alignment
- Create a user-started 30-day journey with the brief’s four weeks and exact task targets; no tasks are completed automatically.
- Include task descriptions, week, due date, notes, status and completion timestamp; support custom tasks, deadline edits and per-week/overall progress.
- Starting another journey archives the previous one without losing its tasks or history.
- Add the three optional five-minute alignment activities, visualization reflections, selected affirmation, daily action creation and saved completion history.
- Track applications, networking, interview practice and learning as explicit user-recorded activity, not inferred achievements.
- Verify concrete task targets, completion arithmetic, timestamps, date boundaries and historical journey preservation.

## Milestone 4 — Evidence-based coaching and resume connection
- Add an authenticated AI Career Coach covering clarity, strengths, planning, confidence, job-description gaps and reflection.
- Build context from the owner’s actual intention, profile, selected resume and action history. Journal context is excluded by default and included only for explicitly selected, approved entries.
- Separate user facts from suggestions; prohibit invented credentials/metrics and outcome guarantees; save private coaching sessions and provide recoverable failure states.
- Extend the existing Resume Studio assistant with target-role context, supported summary/bullet suggestions, completeness and ATS-readability guidance, and job-description comparison.
- Create tailored copies only after explicit acceptance; keep originals, templates, defaults, editing and PDF exports intact.
- Verify real-context requests, journal consent, accepted changes and original-resume preservation.

## Milestone 5 — Reports, polish and regression checks
- Add personal Career Growth Reports using saved activity only: weekly activity chart, 30-day progress, completed/pending commitments, milestones and export.
- Finish cohesive candidate navigation without duplicate entries; application/interview screens reuse the shared activity tracker rather than disconnected demo pages.
- Update public positioning with the supplied messages and selectively reuse existing workplace imagery. Keep productivity screens focused and accessible.
- Audit installed-app behavior: no manifest or service-worker setup was found in the initial inspection. Verify the actual current installation support before claiming PWA compatibility; add standards-based install support if absent and exclude authentication traffic from caching.
- Verify existing authentication, candidate/recruiter flows, profile/privacy settings, Resume Studio and desktop/mobile behavior; provide a final list of implemented features, database/security changes, tests and any remaining limits.

## Technical approach
- Use additive application tables for intentions/visions, board items, affirmations/completions, journals/reflections, journeys/tasks, routines, coaching and milestones; reuse existing profiles and resumes rather than duplicate them.
- Every new record has an owner, timestamps, appropriate indexes, explicit grants and owner-only RLS. Parent/child ownership must be enforced as well as individual row ownership. Recruiter access to discoverable profiles must not confer access to these private records.
- Apply schema changes through the existing migration workflow, with no deletion or modification of accounts or roles. Include new private assets and data in account-deletion cleanup.
- Use shared Zod validation and authenticated TanStack server functions, existing query patterns and server-only AI Gateway helpers. Keep private content out of logs, public metadata and the sitemap.
- Keep routes distinct, authenticated and individually titled. Use existing design components and semantic color tokens; respect reduced motion and keyboard/touch access.
- Add focused tests for privacy, ownership, AI-context consent, exact plan quantities, progress and preservation rules; run them at each milestone alongside browser acceptance checks.

## Verification boundaries
Hosted provider settings can be checked, but a real Google authorization cannot be completed without the user’s provider interaction. Cross-account/recruiter privacy checks require suitable test accounts; create isolated test accounts where supported or report the unavailable check rather than imply it passed. AI uses the existing managed service and requires no new private API key.

Optional notifications/reminders will be added only if genuine notification delivery support is available; otherwise routines remain usable without them.