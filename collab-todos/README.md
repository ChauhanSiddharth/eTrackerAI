# CollabTodos

A collaborative todo app built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- Email/password authentication via Supabase Auth
- Create and manage todo lists
- Invite connections (friend system with accept/reject)
- Share lists with accepted connections
- Both list members can create, update, and delete todos
- Real-time todo updates via Supabase Realtime
- Row Level Security (RLS) for all authorization

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings > API

### 2. Run the Database Migration

1. Open the Supabase SQL Editor (Dashboard > SQL Editor)
2. Copy the contents of `supabase/migrations/001_schema.sql`
3. Paste and run it in the SQL Editor

This creates all tables, enums, RLS policies, and triggers.

### 3. Configure Supabase Auth

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Ensure **Email** provider is enabled
3. Optionally disable email confirmation for development (Auth > Settings > toggle off "Enable email confirmations")

### 4. Enable Realtime

In your Supabase dashboard:
1. Go to Database > Replication
2. Enable realtime for the `todos` table

### 5. Set Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Install Dependencies and Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
collab-todos/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Sign-in page
│   │   │   └── signup/page.tsx      # Sign-up page
│   │   ├── (protected)/
│   │   │   ├── layout.tsx           # Nav bar + auth guard
│   │   │   └── app/
│   │   │       ├── page.tsx         # Lists dashboard
│   │   │       ├── lists/[id]/
│   │   │       │   ├── page.tsx     # List detail + todos
│   │   │       │   ├── todo-list.tsx
│   │   │       │   └── share-section.tsx
│   │   │       └── connections/
│   │   │           ├── page.tsx     # Connections dashboard
│   │   │           ├── search-users.tsx
│   │   │           ├── incoming-requests.tsx
│   │   │           └── accepted-connections.tsx
│   │   ├── auth/callback/route.ts   # OAuth callback handler
│   │   └── page.tsx                 # Root redirect
│   ├── lib/supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts            # Auth session refresh
│   └── middleware.ts                # Next.js middleware
└── supabase/
    └── migrations/
        └── 001_schema.sql           # Full DB schema + RLS
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com/) and import your GitHub repo
2. Set the **Root Directory** to `collab-todos`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Update Supabase Auth Redirect

After deploying, add your Vercel URL to Supabase:
1. Go to Authentication > URL Configuration
2. Add `https://your-app.vercel.app/**` to the Redirect URLs

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `connections` | Friend/connection requests (pending/accepted/rejected) |
| `todo_lists` | Todo list metadata |
| `list_members` | Which users belong to which lists (owner/editor) |
| `todos` | Individual todo items |

All tables use Row Level Security. See `001_schema.sql` for the full policy definitions.
