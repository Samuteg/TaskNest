# TaskNest — Project & Task Management SaaS

## Overview

Full-stack SaaS for project and task management with real-time collaboration. Built on the existing TaskNest monorepo (Turborepo + Bun + Vite + React 19 + TanStack Router/Query + oRPC + Drizzle + PostgreSQL + better-auth + shadcn/ui).

## Database Schema

### New Tables

**projects**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | not null |
| description | text | nullable |
| owner_id | text | FK → user.id, not null |
| created_at | timestamp | default now(), not null |
| updated_at | timestamp | default now(), not null |

**project_members**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| project_id | uuid | FK → projects.id, onDelete cascade, not null |
| user_id | text | FK → user.id, onDelete cascade, not null |
| role | enum(owner, admin, member) | not null, default member |
| created_at | timestamp | default now(), not null |

Unique constraint on (project_id, user_id).

**tasks**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| project_id | uuid | FK → projects.id, onDelete cascade, not null |
| title | text | not null |
| description | text | nullable |
| status | enum(todo, in_progress, done) | not null, default todo |
| priority | enum(low, medium, high, urgent) | not null, default medium |
| assignee_id | text | FK → user.id, nullable |
| due_date | timestamp | nullable |
| created_at | timestamp | default now(), not null |
| updated_at | timestamp | default now(), not null |

**invitations**
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| project_id | uuid | FK → projects.id, onDelete cascade, not null |
| email | text | not null |
| invited_by | text | FK → user.id, not null |
| role | enum(admin, member) | not null, default member |
| status | enum(pending, accepted, expired) | not null, default pending |
| created_at | timestamp | default now(), not null |
| expires_at | timestamp | not null (created_at + 7 days) |

### Enums

```sql
CREATE TYPE project_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
```

## API Layer (oRPC Routers)

### File Structure

```
packages/api/src/routers/
├── index.ts          — merge all sub-routers
├── projects.ts       — project CRUD
├── tasks.ts          — task CRUD + status update
├── members.ts        — list, updateRole, remove
├── invitations.ts    — create, accept, cancel, list
└── profile.ts        — update profile, change password
```

## Frontend Routes

```
/                           → LandingPage (public)
/login                      → LoginPage (existing)
/_auth/                     → AuthGuard (existing)
/_auth/dashboard            → ProjectListPage
/_auth/dashboard/$projectId → ProjectDetailPage (Kanban board)
/_auth/settings             → ProfileSettingsPage
/_auth/settings/$projectId  → ProjectSettingsPage (members + invites)
```
