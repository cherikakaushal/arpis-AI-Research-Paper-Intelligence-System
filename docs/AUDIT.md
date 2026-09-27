# Frontend audit — September 2026

The repository uses Next.js App Router, React 19, strict TypeScript, CSS modules and global dark/cyan theme tokens. Existing routes were requested against the running local development server before implementation. The public deployment could not be retrieved by the browsing tool.

Working/reusable: project creation/edit/delete; paper metadata and favorites; IndexedDB PDF storage/reader; editable notes; metadata comparison; shared-keyword relationships; DOI/arXiv metadata import; JSON/CSV export. Most pages handle empty states. Existing React providers expose reusable contracts.

Mocked: automatic seed projects/papers, historical project counters, local keyword search presented inside chat, metadata-only review outlines. There is no LLM integration, authentication, profile or onboarding. The API helper points to an unused localhost backend.

Refactoring needed: three separate localStorage providers lack account isolation and robust validation; mutations can lose updates from stale state; settings/theme persistence lives in UI; history is inferred from current records rather than an event log. The favicon points to a missing PNG. Public landing and authenticated dashboard share a route. Research domains are too narrow. Existing PRODUCT.md describes an earlier backend-first scope superseded by the current request.

Add: local accounts/session and onboarding, shared versioned repository, datasets, experiments/results, questions, hypotheses, evidence, cross-object links, global search, action notifications/activity, import validation, profile/settings, optional multidomain demo, real client-safe AI provider, and acceptance tests.

Preserve: project-oriented routes, PDF storage, metadata tools and dark/cyan identity. New data is account scoped. Legacy data remains untouched and is available for explicit import rather than silently assigned to a new account.
