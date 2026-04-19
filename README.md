# LearnPath — Personalised Learning Platform

LearnPath is a full-stack web application that generates a personalised learning roadmap based on your career goal, existing skills, learning speed, and available study hours. It includes a gamified dashboard with progress tracking, a weekly timetable, and an achievement badge system.

---

## Features

- **Onboarding flow** — choose a career goal, select existing skills, set study schedule
- **AI-powered recommendations** — scikit-learn ML backend generates a personalised topic list, skipping skills you already know and scaling hours to your learning speed
- **Learning path dashboard** — checkable topic list with overall progress bar
- **Auto-generated timetable** — weekly study schedule built from your available hours
- **Rewards system** — 5 milestone badges earned as you complete topics
- **Authentication** — email/password sign-up and login via Supabase Auth
- **Fully typed** — TypeScript throughout the frontend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TanStack Router (file-based routing) |
| Build tool | Vite 7 + Bun |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Backend / database | Supabase (Postgres + Auth + Row Level Security) |
| ML backend | Python · FastAPI · scikit-learn RandomForest |
| Deployment target | Cloudflare Workers (frontend) |

---

## Project Structure

```
skill-quest-hub-87/          ← Frontend (React + TanStack)
├── src/
│   ├── routes/
│   │   ├── index.tsx         Landing page
│   │   ├── signup.tsx        Sign up
│   │   ├── login.tsx         Login
│   │   ├── onboarding.tsx    Profile setup + path generation
│   │   ├── dashboard.tsx     Main app (path, timetable, rewards)
│   │   └── api/
│   │       └── recommend.ts  Server route → calls ML backend
│   ├── lib/
│   │   └── skillMaps.ts      Career path data + timetable generator
│   ├── integrations/
│   │   └── supabase/         Supabase client + types + auth middleware
│   └── components/
│       └── ui/               35 shadcn/ui components
├── supabase/
│   └── migrations/           Database schema (1 SQL file)
├── wrangler.jsonc            Cloudflare Workers config
└── package.json

ml-backend/                  ← ML Recommendation API (Python)
├── training_data.py          Topic catalogues + 40 training records
├── model.py                  Trains RandomForest, saves model.pkl
├── main.py                   FastAPI server · POST /recommend
├── requirements.txt          Python dependencies
├── model.pkl                 Generated — run model.py to create
└── label_encoders.pkl        Generated — run model.py to create
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Frontend tooling |
| Bun **or** npm | any | Package manager / dev server |
| Python | 3.10+ | ML backend |
| Supabase account | — | Database + auth |

---

## 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, open and run the migration file:
   ```
   supabase/migrations/20260413140848_84f3d836-0540-40e3-bd6e-3edfb9637fd4.sql
   ```
   This creates all five tables (`profiles`, `learning_paths`, `topics`, `timetable_entries`, `rewards`) with Row Level Security enabled.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2 — Environment Variables

Create a `.env` file in the project root (`skill-quest-hub-87/`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
ML_API_URL=http://localhost:8000
```

> **Never commit `.env` to Git.** It is already listed in `.gitignore`.  
> See `.env.example` for the full list of required variables.

---

## 3 — ML Backend Setup

Open a terminal and navigate to the `ml-backend/` folder.

**Create and activate a virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Train the model** (creates `model.pkl` and `label_encoders.pkl`):

```bash
python model.py
```

Expected output:
```
Trained on 40 samples  |  23 features  |  9 outputs
Saved → model.pkl, label_encoders.pkl
```

**Start the API server:**

```bash
uvicorn main:app --reload --port 8000
```

The ML backend is now running at `http://localhost:8000`.

You can verify it at: `http://localhost:8000/health`  
Interactive API docs at: `http://localhost:8000/docs`

---

## 4 — Frontend Setup

Open a **new terminal** in the project root (`skill-quest-hub-87/`).

**Using Bun (recommended):**

```bash
bun install
bun dev
```

**Using npm (if Bun is not installed):**

```bash
npm install
npm run dev
```

The frontend will be running at `http://localhost:3000` (or `http://localhost:5173`).

> Both the frontend dev server and the ML backend must be running at the same time for the full onboarding flow to work.

---

## 5 — Full Local Setup (quick reference)

```bash
# Terminal 1 — ML backend
cd ml-backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
python model.py
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd skill-quest-hub-87
bun install
bun dev
```

Open `http://localhost:3000`, sign up, and complete onboarding to generate your learning path.

---

## Available Scripts

### Frontend (`skill-quest-hub-87/`)

| Command | Description |
|---|---|
| `bun dev` | Start development server with hot reload |
| `bun build` | Build for production |
| `bun preview` | Preview the production build locally |
| `bun lint` | Run ESLint |

### ML Backend (`ml-backend/`)

| Command | Description |
|---|---|
| `python model.py` | Train the model and save `.pkl` files |
| `uvicorn main:app --reload --port 8000` | Start the FastAPI server in dev mode |
| `uvicorn main:app --port 8000` | Start the FastAPI server in production mode |

---

## How the ML Recommendation Works

When a user completes onboarding, the frontend sends a `POST /recommend` request to the FastAPI server with:

```json
{
  "career_goal": "Python Developer",
  "current_skills": ["Python", "Flask"],
  "learning_speed": "Intermediate",
  "hours_per_day": 2
}
```

The ML model (a `RandomForestClassifier` wrapped in `MultiOutputClassifier`) predicts which topics to include for that user. Topics the user already knows are excluded, and `estimatedHours` is scaled by a speed multiplier (Beginner ×1.3 · Intermediate ×1.0 · Fast Learner ×0.7).

The server returns a `CareerPath` JSON object that the frontend uses to create the learning path and timetable in Supabase.

**Fallback behaviour:** If the ML backend is unreachable, the TanStack `/api/recommend` route falls back to rule-based local logic so the app never breaks.

---

## Database Schema

Five tables, all with Row Level Security (users can only access their own data):

| Table | Purpose |
|---|---|
| `profiles` | User preferences, career goal, schedule, onboarding status |
| `learning_paths` | Named learning paths tied to a user |
| `topics` | Individual topics within a path, with completion tracking |
| `timetable_entries` | Day-by-day scheduled study tasks |
| `rewards` | Earned badges persisted per user |

---

## Deployment

### Frontend → Cloudflare Workers

```bash
# Install Wrangler CLI if not already installed
npm install -g wrangler

# Authenticate
wrangler login

# Set the ML backend URL as a secret
wrangler secret put ML_API_URL
# Enter: https://your-ml-api.yourdomain.com

# Deploy
bun run build
wrangler deploy
```

### ML Backend → Railway / Render / Fly.io

Any platform that runs Python works. Example with Railway:

1. Push the `ml-backend/` folder to a separate GitHub repository (or a subfolder)
2. Create a new Railway project and point it at that repo
3. Set the start command to: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Copy the deployed URL and set it as `ML_API_URL` in your Cloudflare Worker secrets

---

## Supported Career Paths

| Career Goal | Topics |
|---|---|
| Python Developer | Python Basics → Flask → REST API → Testing & Deployment |
| Web Developer | HTML/CSS → JavaScript → React → Full-Stack Project |
| Data Scientist | Python for DS → Statistics → ML Basics → Capstone Project |
| Mobile App Developer | JS/TypeScript → React Native → Native APIs → App Store |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT
