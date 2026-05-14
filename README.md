# LearnFlow 🎓

> Transform any YouTube playlist into a structured, distraction-free learning experience.

![LearnFlow](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **📚 Playlist → Course** — Paste any YouTube playlist URL and get a structured curriculum instantly
- **🎯 Distraction-free player** — Videos play without recommendations, ads, or anything pulling you away
- **✅ Progress tracking** — Mark videos complete, synced to your account across all devices
- **📊 Visual progress** — Progress rings and bars showing exactly where you are
- **🔐 Authentication** — Email/password login with Supabase Auth
- **♾️ Unlimited courses** — Add as many playlists as you want
- **📱 Responsive** — Works on all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com) account for YouTube API

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/learnflow.git
cd learnflow
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: add `http://localhost:3000/api/auth/callback`

### 3. Set Up YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **YouTube Data API v3** from the API Library
4. Go to **Credentials → Create Credentials → API Key**
5. (Recommended) Restrict the key to YouTube Data API v3

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
YOUTUBE_API_KEY=AIzaxxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Update Supabase Auth settings with your production URL
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/learnflow)

### Deploy to Other Platforms

LearnFlow is a standard Next.js app. It runs anywhere that supports Node.js:
- **Railway** — `railway up`
- **Render** — connect repo, set env vars
- **Self-hosted** — `npm run build && npm start`

---

## 🏗️ Project Structure

```
learnflow/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/page.tsx        # Auth page (login + signup)
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── course/[id]/page.tsx  # Course view with player
│   │   └── api/
│   │       ├── playlist/route.ts # Add/delete playlists
│   │       └── auth/callback/    # Supabase auth callback
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── CourseCard.tsx
│   │   ├── VideoPlayer.tsx       # Distraction-free YT embed
│   │   ├── ProgressRing.tsx      # SVG progress ring
│   │   └── AddCourseModal.tsx
│   ├── lib/
│   │   ├── supabase.ts           # Browser Supabase client
│   │   ├── supabase-server.ts    # Server Supabase client
│   │   └── youtube.ts            # YouTube Data API helpers
│   ├── types/index.ts
│   └── middleware.ts             # Auth route protection
├── supabase/
│   └── schema.sql                # Database schema + RLS
└── .env.example
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase |
| Styling | Tailwind CSS + Custom CSS |
| Fonts | Playfair Display + Sora |
| Icons | Lucide React |
| Video | YouTube IFrame API (privacy-enhanced mode) |

## 🎨 Design Decisions

- **`youtube-nocookie.com`** embed domain — prevents YouTube from setting tracking cookies
- **`rel=0`** — limits related videos to the same channel only
- **`modestbranding=1`** — removes YouTube logo from the player
- **`iv_load_policy=3`** — disables video annotations
- **Row Level Security** — all database queries are scoped to the authenticated user

## 🔒 Privacy & Security

- All user data is isolated with Supabase RLS (Row Level Security)
- YouTube videos are embedded via `youtube-nocookie.com`
- No analytics or tracking beyond what Supabase provides
- API keys are server-side only (YouTube API key is never exposed to the browser)

## 📝 YouTube API Quota

The free YouTube Data API tier gives you **10,000 units/day**. Adding a playlist costs:
- 1 unit for playlist metadata
- ~1 unit per 50 items for playlist items
- ~1 unit per 50 videos for duration lookups

A 100-video playlist costs ~5 units. You can add ~2,000 such playlists per day on the free tier.

## 🤝 Contributing

PRs welcome! Please open an issue first for major changes.

## 📄 License

MIT — free to use, modify, and deploy.
