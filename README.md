# Real-Time Collaborative Document Editor

A collaborative, Google-Docs-style document editor built on the MERN stack, with real-time multi-user editing powered by CRDTs (Yjs) and Socket.IO.

## Overview

This project implements a full-stack collaborative editing system from the ground up: authentication, document management, a rich text editor, live multi-user synchronization, permissions, version history, and a durable persistence layer for real-time editing state.

The core design challenge — and the main focus of this project — is keeping a document's real-time editing state (Yjs) consistent, durable, and recoverable across server restarts, while still storing a plain, version-history-friendly copy of the document's content.

## Features

- **Real-time collaborative editing** — multiple users can edit the same document simultaneously, with conflict-free merging powered by [Yjs](https://github.com/yjs/yjs) CRDTs, integrated with a [TipTap](https://tiptap.dev/) rich text editor.
- **Live presence** — see who else is currently viewing a document, join/leave notifications, and typing indicators.
- **Role-based access control** — owner / editor / viewer permissions per document, enforced on both REST and WebSocket paths.
- **Document sharing** — invite collaborators by email with a specific role.
- **Version history** — save and restore prior versions of a document, with restores applied as authoritative CRDT operations so live collaborators stay in sync.
- **Durable real-time state** — Yjs editing state is persisted independently of document content, using a snapshot + incremental-update model so a server restart doesn't lose in-progress collaborative edits.
- **Horizontally scalable transport** — Socket.IO backed by a Redis adapter, so real-time events can be broadcast correctly across multiple backend instances.

## Tech Stack

**Frontend:** React (Vite), TipTap, Yjs, Socket.IO client

**Backend:** Node.js, Express, Socket.IO, Mongoose (MongoDB), Redis

**Real-time / CRDT:** Yjs, `@tiptap/extension-collaboration`, `@tiptap/y-tiptap`

## Architecture

### Real-time sync

Each client holds a local `Y.Doc` bound to the TipTap editor via the Collaboration extension. Local edits are broadcast as Yjs updates over Socket.IO; the server applies incoming updates to an in-memory, per-document `Y.Doc` and relays them to every other connected client in that document's room.

### Persistence

Document content is stored in MongoDB as plain TipTap JSON, kept independent of the Yjs layer for backward compatibility with version history. The Yjs editing state itself is persisted separately using a **snapshot + incremental update** model:

- Every individual Yjs update is persisted with an atomically-assigned sequence number.
- Periodic snapshots (triggered by update count, a time interval, or the last collaborator leaving) checkpoint the full document state, after which superseded updates are cleaned up.
- On first access after a restart or memory eviction, a document's live state is reconstructed from its latest snapshot plus any updates recorded since, rather than replaying an unbounded history.

This keeps steady-state memory and storage bounded while ensuring collaborative edits survive a server restart.

### Access & presence

Document roles are resolved once when a user joins a document and cached for the duration of that connection, rather than re-checked on every edit. Presence (who's currently active in a document) is tracked in Redis and kept in sync across disconnects and explicit "leave document" actions.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Redis instance (local or managed)

### Installation

```bash
# clone the repo
git clone <repo-url>
cd <repo-name>

# install backend dependencies
cd backend
npm install

# install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend (`backend/.env`):**

```
PORT=4000
URL=<mongodb-connection-string>
REDIS_URL=<redis-connection-string>
ACCESS_TOKEN_SECRET=<jwt-secret>
CORS_ORIGIN=<frontend-url>
```

**Frontend (`frontend/.env`):**

```
VITE_API_URL=<backend-url>
```

### Running locally

```bash
# start the backend
cd backend
npm run dev

# start the frontend
cd frontend
npm run dev
```

## Project Structure

```
backend/
├── auth/          # access control logic
├── controller/    # REST controllers
├── middleware/    # request middleware
├── model/         # Mongoose schemas
├── router/        # Express routes
├── socket/        # Socket.IO handlers, live document state
├── utils/         # Yjs persistence, snapshotting, reconstruction
└── app.js

frontend/
├── src/
│   └── api/       # fetch wrapper with auth
└── pages/         # Login, Dashboard, Document editor, Version history
```


## License

MIT
