# ARPIS product contract

ARPIS is an **AI Research Operating System**. It helps researchers turn a focused question and a collection of papers into traceable knowledge and research outputs.

## Central object

`Project` is the required context for all research work. A project owns:

- Papers
- Chat
- Notes
- Knowledge Graph
- Literature Review
- Comparisons
- Exports

Upload, chat, comparison, graph, and history are not independent destinations. They are actions or views within a project. The global dashboard exists to create, find, and resume projects.

## Product boundaries

- The Next.js application is a REST API client only; it does not contain API route handlers.
- The Express backend lives in a separate `arpis-backend` repository.
- MongoDB persistence begins after the backend foundation exists.
- Paper upload is implemented only after Projects and Papers have backend models and routes.

## Initial flow

Dashboard → Project → Upload paper → Store paper → Generate summary → Save metadata → Ready

## Phase 0 success criteria

- The product name and central object are unambiguous.
- The home page starts with projects, not disconnected tools.
- Navigation and future APIs can be evaluated against project ownership.
