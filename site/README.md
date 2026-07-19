# Ramiyar Karanjia

Next.js redesign of [ramiyarkaranjia.com](https://ramiyarkaranjia.com/) — calm newspaper layout, large type for older readers. Content is served from **Firebase Firestore** (with local Markdown as seed/fallback).

## Run

```bash
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin (edit content)

1. Open [http://localhost:3000/admin](http://localhost:3000/admin)
2. Sign in with an allowlisted editor account
3. Edit articles, section navigation, or site settings and Save

Allowlisted emails are set in `ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_EMAILS` (currently `ncarnac@gmail.com` and `ramiyark@gmail.com`). Temporary passwords (local only) are in `.admin-credentials.local` — change them after first login.

## Firebase

Project: `ramiyar-karanjia` (Spark / free). Auth: email/password. Rules: public read; write only for allowlisted admins.

```bash
npm run seed           # re-import Markdown + nav into Firestore
npm run create-admins  # create/update Auth users from .admin-credentials.local
npx firebase-tools@latest deploy --only firestore,auth
```

Env vars live in `.env.local` (not committed). For Vercel, copy the same `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, and `ADMIN_EMAILS` values into the project settings.
