# ARPIS frontend

## Validation status at handoff

TypeScript and the production build passed. The complete researcher journey browser test passed: signup, onboarding skip, project/source/evidence/note/dataset/experiment creation, measurements, search, profile persistence, export/import merge, logout/login, refresh and account isolation. The remaining responsive/reset and AI-fixture test reruns were interrupted by development-server/dependency work and are not reported as passing. Real provider inference still needs a researcher to connect their Puter account.

The dependency audit reported 16 advisories, including an affected Next.js release. An attempted update to the verified patched release failed due to network/reset and local file-lock errors; the committed manifest retains Next.js 16.0.10. Resolve the dependency advisories and rerun the full suite before treating this as production-ready.

ARPIS is a domain-agnostic AI Research Operating System. This phase runs entirely in the browser; there are no new API routes, database servers, or authentication servers.

## Run and configuration

```sh
npm install
npm run dev
npm run lint
npx tsc --noEmit --incremental false
npm run build
npx playwright test
```

Browser tests use the running development server at `http://localhost:3000` and installed Microsoft Edge. Set `ARPIS_TEST_URL` for another local test URL. Tests create isolated browser contexts and local demo accounts; they do not modify an existing browser profile.

Optional public environment variable: `NEXT_PUBLIC_AI_MODEL=gemini-3.1-flash-lite`. Settings can override the model per local account. No secret AI keys or authentication secrets are required. Do not place provider secret keys in any `NEXT_PUBLIC_*` variable. No environment variables are required to use local research features.

## Route and feature map

| Routes | Features |
| --- | --- |
| `/` | Landing, workflow preview, multidomain Explore Demo |
| `/signup`, `/login` | Validated local accounts, salted password verifier, persistent session |
| `/forgot-password`, `/reset-password` | Explicit local reset link, 15-minute expiry, single use |
| `/verify-email` | Clearly labeled local verification simulation; no mail sent |
| `/onboarding` | Welcome, multiple domains, current focus, optional first project |
| `/dashboard` | Actual account counts, recent projects, sources, activity, quick actions |
| `/research`, `/projects` | Search/filter/sort projects, duplicate metadata and research records |
| `/research/new`, `/projects/new` | Project creation, initial questions and hypothesis |
| `/projects/[id]` | Connected overview and project tabs |
| `/projects/[id]/questions`, `/hypotheses`, `/evidence`, `/notes`, `/datasets`, `/experiments` | Project-scoped research records |
| `/projects/[id]/papers`, `/chat`, `/activity`, `/settings` | Source library, real AI chat, timeline, lifecycle management |
| `/papers`, `/papers/new`, `/papers/[id]` | Generic source library, metadata editor, favorites, archive, citation, evidence, notes |
| `/questions`, `/hypotheses`, `/evidence`, `/notes`, `/datasets`, `/experiments` | Cross-project collections, search/filter/sort |
| `/<collection>/new`, `/<collection>/[id]` | Create/edit records; linked objects, tags, statuses |
| `/assistant` | Global, project, paper, dataset, experiment contexts; persistent conversations |
| `/search` | Grouped global search with exact object destinations |
| `/notifications`, `/activity`, `/history` | Real action notifications and event history |
| `/profile` | Avatar, name, email, institution, domains, interests, bio, ORCID, website, location, citation/language preferences |
| `/settings` | Theme/density, research and AI preferences, notification controls, JSON/CSV export, validated merge/replace import, local deletion |

Retained tools: `/fetch` (DOI/arXiv metadata lookup), `/workspace`, `/upload`, `/compare`, `/graph`, `/pdf-heatmap` (abstract keyword highlighting), `/terminal` (local navigation/search commands), `/playlab` (explicit illustrations), `/analyze`, `/results`, and `/research-chat` (assistant alias). Project comparison, topic graph, review outline and export routes remain available. Existing nested paper detail/notes/PDF-reader/upload URLs continue to work.

## Architecture and state

`src/lib/research-model.ts` defines account, profile, session, workspace, research records, conversations, events and settings. Existing Project and Paper types are extended, preserving existing tools.

`src/services/repositories/localRepository.ts` defines the replaceable repository contract, versioned local implementation, import validation, deterministic merge, and explicit legacy import. `src/store/WorkspaceProvider.tsx` owns shared state and operations. Components use that store or compatibility providers; new components do not access localStorage directly. Writes read the latest repository snapshot and persist before publishing UI state. Storage events synchronize open tabs. Failed writes produce a persistent error and do not publish a successful state update.

Accounts and workspaces are stored in `arpis_database_v2`. Workspaces are keyed by account UUID; logout clears only the simulated session. No samples are inserted into ordinary accounts. Explore Demo creates a separate labeled account with Computer Science, Physics, Climate Science, and Biology projects. Legacy v1 project/paper/research keys remain untouched until the researcher explicitly previews and imports them in Settings.

The v2 schema is checked on load; unsupported versions are rejected without overwriting the saved data. Additive defaults normalize settings/collections. Import requires a supported version, typed collections, unique IDs and valid project references. Merge keeps local records when IDs conflict; replace asks for confirmation. Imported settings are not applied. Passwords and account records are excluded from research exports.

Local PDF blobs use the existing IndexedDB repository, `arpis-local-files`. Dataset files are descriptors only (name, type, size); no dataset bytes are stored. Duplicated projects copy metadata and research records, not PDF blobs. Avatar data URLs are limited to 300 KB.

## AI provider

`src/services/ai/aiProvider.ts` exposes `AIProvider` and `generateResearchResponse()`. The current adapter uses [Puter.js chat](https://docs.puter.com/AI/chat/) with real streaming. The SDK loads only when the user chooses to load the provider; connection is an explicit user click. [Puter's user-pays model](https://docs.puter.com/user-pays-model/) uses the researcher's provider account and allowance/billing. ARPIS does not promise unlimited free inference.

The user can inspect context and opt in to sending saved metadata/notes. PDF contents are not extracted or sent. Provider calls include recent conversation history, chosen context, and a system instruction that distinguishes evidence from synthesis. The UI labels AI synthesis and lists shared sources; it does not claim externally retrieved citations or academic searches. Markdown/code/tables are rendered without executing raw HTML.

Conversation controls include new, rename, archive, delete, clear, copy, regenerate/retry, streaming and local stop. Errors are visible; successful answers come only from the provider. Stop stops local consumption; provider-side computation/billing may continue. Requests have a 90-second timeout. The browser test provider fixture is injected only by tests; no fake-answer fallback exists in the application.

## Local simulations and limitations

- Frontend accounts are not secure authentication or access control. Anyone with browser/devtools access can alter local state. Password hashing is a hygiene measure, not a security claim.
- Password recovery and email verification are explicitly simulated on this device. No ownership checks, emails, server sessions, or real authorization.
- Browser storage can be cleared, denied or exhausted. Export backups; no cloud sync, guaranteed durability or multi-device access. Concurrent tabs use latest-snapshot writes, not a transactional server database.
- Dataset schema, versions, experimental status and measurements are researcher-entered. No file parsing, experiment execution, scientific verification or automated completion.
- AI requires network access and the user's external provider sign-in. Actual third-party inference cannot be acceptance-tested without a provider account. Provider failures and streaming behavior are covered with an explicit test fixture.
- Metadata import depends on external API availability/CORS. Legacy topic graphs are shared-keyword relationships, not citation graphs. Review outlines are editable metadata templates, not AI syntheses.
- Collaboration is a stated future capability. No fake collaborators, testimonials, enterprise logos, or research statistics.

## Next backend phase

Replace the repository with authenticated API implementations, keeping the view models and UI contracts. Introduce real identity/email recovery and authorization, PostgreSQL entities with ownership and relational constraints, object storage with signed URLs, import validation and schema migrations on the server. Add an AI gateway with server-held secrets, rate/cost limits and consent/audit logging. Then add text extraction, background jobs, evidence-grounded retrieval, real citation resolution and team permissions. Experiment execution should remain a separate explicit, auditable capability.
