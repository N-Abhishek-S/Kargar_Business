# Kargar Facility Management Frontend

Single deployable Vite + React application for Kargar Facility Management.

## Architecture

```text
React + Vite
  -> Supabase Auth
  -> Supabase Database
  -> Supabase Storage
```

There is no separate server, Node API, API gateway, or second Vercel deployment.

## Environment

Create `frontend/.env` with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://your-frontend.vercel.app
VITE_SITE_NAME=Kargar Facility Management
```

Optional analytics variables may remain empty.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run type-check
npm run lint
npm run build
```

## Deployment

Deploy only the `frontend/` directory to Vercel.

Admin access uses Supabase Auth. Admin users must have `app_metadata.role` set to `admin` or `super_admin` so the existing Supabase RLS policies allow admin reads and writes.
