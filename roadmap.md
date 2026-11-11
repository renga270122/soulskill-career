# B2C-only application
- [x] Remove hiring entry points, registration choices, dashboards, navigation and discovery integrations; retain redirect-only legacy URL and all saved data. No database migrations or account mutations.
- [x] Update public information and career copy; verify candidate-only registration payload without creating a test account, signed-in career tools and desktop/mobile navigation. Real Google/email sign-in and historical non-career account end-to-end checks not exercised; existing auth preserved, routing rules tested.

# Premium International Resume Studio redesign (uploaded spec)
- [x] Audit existing resume builder: routes, data model, templates, PDF/DOCX export, ATS, AI integrations.
- [x] Eight spec templates (Classic, Modern, Executive, Tech Professional, Innovator, Corporate, Creative, Graduate) with distinct layout configs; four legacy designs preserved. Database constraint widened for the two new keys.
- [x] Studio interface: gallery with distinct thumbnails, live preview, debounced autosave with race guard, desktop split view; verified persistence across reload.
- [x] Multi-page support: entry keep-together, no isolated section headings, page numbering, A4 + US Letter; covered by layout tests.
- [x] PDF + real DOCX export (docx library, ZIP signature and Letter dimensions tested); preview and PDF render from shared shape data.
- [x] Controlled customization: navy/slate accents added, page size, section order/visibility; zoom controls and page count in preview.
- [ ] ATS Professional vs Visual Professional output-mode labelling in the Studio UI.
- [ ] Additional section types (languages, awards, publications, volunteer, custom) — requires additive career-schema extension shared with profiles.
- [ ] QA matrix: all 8 templates with fresher/experienced/senior/career-transition content and 1–3 page exports (partially covered by layout tests; full visual matrix pending).

# Milestone 2
- [x] Refine recruiter menu and screens into hiring-specific stages and options; six tool panels grouped into role definition, sourcing/assessment and interview/decision stages. Verified signed-in desktop/phone menus, no overflow/runtime errors, four regression tests pass; presentation only, no new hiring functionality.
- [x] Separate recruiter presentation from professional workspace: hiring-focused dashboard/navigation and role-appropriate account settings; seven tests pass, desktop/phone hiring view and professional regression verified, no runtime errors. No saved roles changed.
- [x] Recruiter-only settings and workspace switching retired by the B2C-only request; historical roles remain unchanged.
- [x] Remove demo labels, fabricated recruiter figures and sample dashboard inspiration; verified signed-in candidate/recruiter screens on desktop/phone, no overflow, 15 relevant tests pass. Existing saved user records were preserved.
- [x] Harden repeated Google sign-in attempts and session handoff; six relevant tests pass and Google-style callback reaches the workspace.
- [ ] Verify original incognito/account-selection failure — blocked: real Google account-selection failure was not reproducible; needs a live retry after publication.
- [x] Add JD-based resume keyword match scoring with matched/missing terms and transparent calculation; verified saved-resume and Resume Studio flows on desktop/mobile, stale-score removal and 16 relevant tests; no resume mutations.
- [x] Add public FAQs and Community member discussions; verified signed-in posting/replies, persistence, owner deletion, sitemap and desktop/mobile. Admin deletion is enforced by RLS; no admin account was available for an end-to-end moderation check.
- [x] Phase 1 visual transformation: global ivory/gold design system and inspirational candidate dashboard; no new backend features.
- [x] Apply shared visual language to landing, auth, career tools and public pages; preserve existing workflows and document presentation.
- [x] Verify signed-in desktop/mobile navigation, resume saving/preview/export, ten template choices, job discovery, profile/settings and public pages. All 40 tests pass; no overflow on checked screens.
- [ ] PWA installation verification — blocked: no existing manifest, service worker or install handling was found; no new PWA infrastructure added in this UI-only phase.
- [x] Add public About, Contact and Privacy pages with supplied email; verified navigation, mobile layout and sitemap inclusion.
- [x] Replace the default website icon with a SoulSkill-branded icon; verified the preview serves the 64px PNG and small-size readability. Awaiting publication.
- [x] Private candidate profile, validation, completeness and profile photo storage.
- [x] Resume CRUD, defaults, three live templates and PDF export.
- [x] Working sidebar and mobile navigation; preserve dashboards.
- [x] Test profile/resume persistence, multipage PDF, cross-owner write denial, photo uploads, dashboard and sign-out.
- [ ] Verify read isolation between two populated candidate accounts — blocked: only one account exists.

# Resume Studio upgrade
- [x] Ten original templates, gallery and full-size previews.
- [x] Persist fonts, accents, section order and visibility; matching paginated preview/PDF.
- [x] Private PDF/DOCX upload, extraction, editable review, original-file management.
- [x] Optional evidence-based AI suggestions with explicit acceptance.
- [x] Verify imports, customization, persistence, multipage export, deletion and existing profile/dashboard flows.

# Visual UX enhancement
- [x] Professional workplace imagery: landing hero and feature photos, candidate career-growth banner, recruiter interview banner, Resume Studio empty-state illustration.
- [x] Optimized WebP CDN assets, lazy loading, alt text, rounded containers; dashboards stay clean.
- [x] Verified desktop and mobile layouts via screenshots; full test suite passes.

# Authentication methods
- [x] Remove visitor-facing Lovable login without changing platform integrations, accounts or roles.
- [x] Disable Lovable auth provider and confirm Google/email remain enabled through hosted configuration tools.
- [x] Verify sign-in and sign-up screens on desktop and mobile; all 19 existing tests pass.
- [ ] GitHub sign-in — blocked: not supported by Lovable Cloud.

# SoulSkill 2.0 career transformation
- [x] Candidate Resumes menu: verified DOCX upload, editable review, saved edits, PDF export, resume-linked application tracking and employer URL access on desktop/mobile.
- [ ] Milestone 1: career intention onboarding, editable future identity, affirmations and real-data journey dashboard.
- [ ] Milestone 2: private vision board, affirmation history and searchable daily/weekly journal.
- [ ] Milestone 3: historical 30-day journeys, task tracking, reflections and daily alignment routine.
- [ ] Milestone 4: authenticated evidence-based AI coach and non-destructive Resume Studio tailoring.
- [ ] Milestone 5: personal growth reports, export and cohesive candidate navigation/visual positioning.
- [ ] Verify each milestone: persistence, owner isolation, recruiter privacy, mobile/PWA and existing feature regressions.

## Wrap-up status
- Resume flow verified end-to-end while signed in; all 27 tests passed and latest automatic build reports OK.
- Broader career milestones are partially implemented, not acceptance-complete; remaining verification and refinements are parked at the user's credit check-in stop.
- Evidence-grounded AI coaching now verified with real AI output and persisted history; tailored-copy end-to-end checks remain pending.
- Two-account privacy verification remains blocked by the lack of a second populated candidate account.
- PWA verification remains pending; paused at the user's stop.
- Employer application submission occurs on the employer's website; no direct employer integration is implemented.
# Real job listings
- [x] Replace the two identified test jobs with three live-checked India job listings, preserving Preparing status and existing resumes.
- [x] Show company, location, checked date and genuine employer application links.
- [x] Verify the real listings on desktop and phone.

# Evidence-based AI Career Coach
- [x] Use owned saved profile and selected/default/latest resume; keep goals separate from achievements.
- [x] Render exact source facts, labeled AI actions, unknowns and next action; do not write profile/resume changes.
- [x] Preserve opt-in journal privacy, input on errors and private coaching history.
- [x] Run grounding/privacy tests and verify actual AI output, history reload and phone layout.

# Social-impact pricing
- [x] Free Career Support self-declaration (category + timestamp only, correctable, 6 months, no auto-charge); verified on preview.
- [x] Premium ₹99/₹299/₹499/₹699 one-time plans from the database, savings/expiry display, Popular/Best Value; pricing page + Plans & billing dashboard.
- [x] Server-side gating: AI tools (50/month fair use), premium templates, multiple resumes; ATS behind upgrade prompt. Tests for prices, access, expiry, signatures.
- [ ] Live Razorpay checkout, webhook and all four paid durations end-to-end — blocked: Razorpay test keys not yet provided.
- [ ] Cover letter generation — not built yet (feature does not exist in the app).
