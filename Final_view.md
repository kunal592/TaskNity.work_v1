# 🚀 NextN – AI-Integrated Company Dashboard

A modern **Next.js 15** + **TypeScript** powered admin dashboard for managing users, projects, tasks, finances, attendance, and notices — with **AI assistance** via Google Gemini (Genkit).  
Built with a scalable structure, clean UI, and backend-ready Prisma schema integrated with **Clerk authentication** and **Neon database**.

---

## 📘 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Running the App](#-running-the-app)
- [Database (Prisma + Neon)](#-database-prisma--neon)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [AI (Genkit Setup)](#-ai-genkit-setup)
- [Backend Endpoints](#-backend-endpoints)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🧩 Overview
This dashboard provides an all-in-one workspace for managing:
- Employees, Teams, and Roles
- Projects & Tasks
- Finance Analytics (Expenses & Invoices)
- Attendance & Leave Requests
- Admin Notices
- AI-Powered Reports and Insights

It’s modular, scalable, and optimized for **Next.js App Router** with API routes handled server-side.

---

## 🌟 Features

| Category | Description |
|-----------|--------------|
| 🔐 **Authentication** | Clerk-based auth (Sign in, Sign up, Org support) |
| 🧑‍💼 **User Roles** | Admin / Member / Viewer access levels |
| 🗂️ **Projects** | Progress tracking, member assignments |
| ✅ **Tasks** | Kanban-style task workflow (To-Do, In Progress, Done) |
| 💸 **Finance Management** | Expenses, invoices, salary tracking |
| 🕒 **Attendance & Leaves** | Mark attendance, request leaves |
| 📢 **Notices** | Admin announcements, feedback system |
| 🤖 **AI Assistance** | Google Gemini via Genkit for smart insights |
| 🎨 **UI/UX** | Shadcn/UI + TailwindCSS + Framer Motion animations |
| ⚙️ **Backend** | Next.js API Routes + Prisma ORM + Neon PostgreSQL |

---

## 🧠 Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion |
| **Auth** | Clerk (User management & session handling) |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | Neon PostgreSQL |
| **AI** | Genkit + Google Gemini |
| **Visualization** | Recharts |
| **State Management** | Zustand, Context API |
| **Utilities** | React Hook Form, Lucide Icons, Radix UI |

---

## 🧱 Project Structure
```
src/
 ├── app/                   # Next.js App Router (pages & APIs)
 │   ├── (auth)/            # Clerk authentication routes
 │   ├── (dashboard)/       # Protected admin/member dashboard
 │   └── api/               # Next.js API routes (backend endpoints)
 ├── components/            # Reusable UI and feature components
 ├── context/               # Global React context (AppProvider)
 ├── hooks/                 # Custom React hooks (useToast, useFinanceStore, etc.)
 ├── lib/                   # Utility helpers and constants
 ├── mock/                  # Mock data for development
 ├── store/                 # Zustand state management
 ├── types/                 # TypeScript type definitions
 └── ai/                    # AI logic (Genkit + Gemini)
```

---

## ⚙️ Setup Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/nextn.git
cd nextn
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file in the root directory:
```bash
# Neon Database
DATABASE_URL="postgresql://USER:PASSWORD@ep-YOUR_NEON_URL_HERE.neon.tech/YOUR_DB_NAME?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Google Genkit
GOOGLE_GENAI_API_KEY="your_gemini_api_key_here"
```

---

## 🧩 Database (Prisma + Neon)

### 1️⃣ Initialize Prisma
```bash
npx prisma init
```

### 2️⃣ Replace the contents of `prisma/schema.prisma` with your generated schema.

### 3️⃣ Push Schema to Neon Database
```bash
npx prisma db push
```

### 4️⃣ (Optional) Seed the Database
```bash
npx prisma db seed
```

### 5️⃣ Generate Prisma Client
```bash
npx prisma generate
```

To inspect your data directly:
```bash
npx prisma studio
```

---

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```
Then open → **http://localhost:9009**

### Build for Production
```bash
npm run build
npm start
```

---

## 🧰 Available Scripts

| Script | Command | Description |
|---------|----------|-------------|
| `dev` | `next dev --turbopack -p 9009` | Run development server |
| `build` | `next build` | Build production app |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Lint the project |
| `typecheck` | `tsc --noEmit` | Validate TypeScript |
| `genkit:dev` | `genkit start -- tsx src/ai/dev.ts` | Start Genkit AI service |
| `genkit:watch` | `genkit start -- tsx --watch src/ai/dev.ts` | Watch AI flows during development |

---

## 🤖 AI (Genkit Setup)
Your AI logic is located in `src/ai/genkit.ts`:
```ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```
Run:
```bash
npm run genkit:dev
```
To test AI flows, generate summaries, or build intelligent automations.

---

## 🔌 Backend Endpoints

| Module | Endpoint | Methods |
|---------|-----------|---------|
| Auth | `/api/auth/clerk` | `GET` (Clerk handles session via middleware) |
| Users | `/api/users`, `/api/users/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| Projects | `/api/projects`, `/api/projects/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| Tasks | `/api/tasks`, `/api/tasks/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| Attendance | `/api/attendance` | `GET`, `POST`, `PATCH` |
| Leaves | `/api/leaves`, `/api/leaves/:id` | `GET`, `POST`, `PATCH` |
| Expenses | `/api/expenses`, `/api/expenses/:id` | `GET`, `POST`, `PATCH` |
| Invoices | `/api/invoices`, `/api/invoices/:id` | `GET`, `POST`, `PATCH` |
| Finance | `/api/finance/summary` | `GET` |
| Notices | `/api/notices` | `GET`, `POST`, `PATCH`, `DELETE` |
| AI | `/api/ai/analyze-tasks`, `/api/ai/generate-notice` | `POST` |

---

## ☁️ Deployment

### On Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in **Vercel Dashboard → Settings → Environment Variables**
4. Deploy directly from main branch

### On Docker (optional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 9009
CMD ["npm", "start"]
```

---

## 🪪 License
MIT © 2025 **Kunal Daharwal**

---

## 💡 Next Steps
- [ ] Add Prisma route handlers for each API module
- [ ] Integrate Clerk middleware in `/middleware.ts`
- [ ] Add Genkit AI-powered insights to dashboard
- [ ] Connect with Neon production branch for analytics scaling


---

## 🤖 Why AI Integration
AI is integrated into **NextN** to make the dashboard intelligent, automated, and insight-driven — not just a static management panel.

### 1️⃣ Smart Analytics & Summaries
AI generates daily and weekly summaries of projects, attendance, tasks, and finances — providing automated insights for team leads.

### 2️⃣ Automated Insights & Anomaly Detection
It detects irregular expense trends or project slowdowns and alerts admins before they escalate.

### 3️⃣ Natural Language Queries
Users can ask questions in plain English such as:
> “Which employee completed the most tasks this month?”
> “Show all pending invoices over $1000.”

### 4️⃣ AI-Powered Notices & Feedback
Admins can auto-generate professional feedback or performance notices with consistent tone and clarity.

### 5️⃣ Priority & Task Recommendations
Gemini analyzes task queues to suggest which items to prioritize based on deadlines and importance.

### 6️⃣ Auto Reports & Documentation
Weekly reports, financial summaries, and project analytics can be generated and exported automatically via AI.

**In essence:**
> AI transforms the dashboard into a proactive assistant — automating reports, analyzing trends, and offering actionable insights in real time.
