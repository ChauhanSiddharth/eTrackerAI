# TrackerApp

A collaborative task tracking app built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Supabase. Create todo lists, invite connections, share lists, and collaborate in real-time.

## Features

- **Authentication** — Email/password signup and login via Supabase Auth
- **Todo Lists** — Create, view, and manage multiple task lists
- **Optimistic Updates** — Instant UI feedback for add, toggle, and delete actions
- **Real-time Sync** — Live todo updates across users via Supabase Realtime
- **Connections** — Search users, send/accept/reject friend invites
- **List Sharing** — Share lists with accepted connections (editor role)
- **Profile Management** — View profile details and change password
- **Row Level Security** — All authorization enforced at the database level via Supabase RLS
- **Custom UI** — Designed with a warm palette (cream, teal, steel blue, coral)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime (postgres_changes) |
| Package Manager | pnpm |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [Supabase](https://supabase.com/) account and project

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ChauhanSiddharth/eTrackerAI.git
cd eTrackerAI/collab-todos
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Note your **Project URL** and **anon public key** from **Settings > API**

### 4. Run the database migration

1. Open your Supabase dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_schema.sql` and paste it
5. Click **Run**

This creates:
- 5 tables: `profiles`, `connections`, `todo_lists`, `list_members`, `todos`
- 2 enums: `connection_status`, `member_role`
- RLS policies on all tables
- 3 triggers: auto-create profile on signup, auto-add owner to list members, auto-update `updated_at`
- 1 function: `get_list_members()` for fetching co-members securely

### 5. Configure Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication > Providers > Email**
2. Ensure Email provider is enabled
3. Toggle off **Confirm email** for development (so signup works instantly)

### 6. Enable Realtime

1. Go to **Database > Replication** in the dashboard
2. Toggle **Realtime** on for the `todos` table

This enables live updates when collaborators add, edit, or delete todos.

### 7. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 8. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
collab-todos/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Sign-in page
│   │   │   └── signup/page.tsx             # Sign-up page
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                  # Nav bar + auth guard
│   │   │   ├── account-dropdown.tsx        # User menu (profile, sign out)
│   │   │   └── app/
│   │   │       ├── page.tsx                # Lists dashboard
│   │   │       ├── create-list-form.tsx    # New list input
│   │   │       ├── lists/[id]/
│   │   │       │   ├── page.tsx            # List detail + members
│   │   │       │   ├── todo-list.tsx       # Todos CRUD with optimistic updates
│   │   │       │   └── share-section.tsx   # Share with connections
│   │   │       ├── connections/
│   │   │       │   ├── page.tsx            # Connections dashboard
│   │   │       │   ├── search-users.tsx    # User search + invite
│   │   │       │   ├── incoming-requests.tsx
│   │   │       │   └── accepted-connections.tsx
│   │   │       └── profile/
│   │   │           ├── page.tsx            # Profile details
│   │   │           └── change-password-form.tsx
│   │   ├── auth/callback/route.ts          # Auth callback handler
│   │   ├── globals.css                     # Custom theme + Tailwind
│   │   ├── layout.tsx                      # Root layout
│   │   └── page.tsx                        # Root redirect
│   ├── lib/supabase/
│   │   ├── client.ts                       # Browser Supabase client
│   │   ├── server.ts                       # Server Supabase client
│   │   └── middleware.ts                   # Auth session refresh
│   └── middleware.ts                       # Next.js route middleware
└── supabase/
    └── migrations/
        └── 001_schema.sql                  # Full DB schema + RLS + triggers
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup via trigger) |
| `connections` | Friend requests with status: pending, accepted, rejected |
| `todo_lists` | Todo list metadata with owner reference |
| `list_members` | Maps users to lists with role (owner/editor) |
| `todos` | Individual todo items with completion state |

### RLS Summary

- **profiles** — Authenticated users can read all profiles; can only update their own
- **connections** — Users see their own requests; requester creates, addressee accepts/rejects
- **todo_lists** — Visible only to list members; only owner can create/delete
- **list_members** — Users see their own membership; only list owner can add/remove members
- **todos** — Full CRUD for any list member (owner or editor)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Deploy TrackerApp"
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com/) and import your GitHub repository
2. Set **Root Directory** to `collab-todos`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### 3. Configure auth redirect

After deployment, add your Vercel URL to Supabase:
1. Go to **Authentication > URL Configuration**
2. Add `https://your-app.vercel.app/**` to the **Redirect URLs**

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#F4F0E4` | Page backgrounds, input tints |
| Teal | `#44A194` | Primary buttons, brand, checkboxes, progress bars |
| Steel Blue | `#537D96` | Secondary buttons, avatars, section icons |
| Coral | `#EC8F8D` | Delete actions, error states, decline buttons |
