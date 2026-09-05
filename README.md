# CoreTask — AI-Powered Productivity Dashboard

CoreTask is a full-stack, high-performance task management and project tracking workspace. Built with React and Node.js, it leverages Google Gemini AI to automate project scaffolding, break down complex goals into actionable subtasks, and provide real-time visual analytics.

---

## ✨ Features

* **🤖 AI Task & Subtask Decomposition:** Automatically generate sprint backlogs and break down accepted tasks into sequential, estimated subtask checklists using `gemini-3.6-flash`.
* **📊 Visual Analytics & Velocity Tracking:** Interactive project metrics, priority distributions (`low` | `medium` | `high`), and completion charts powered by `Recharts`.
* **🔐 Auth-Guarded Workflows:** Protected client routes with automatic session checking and seamless `/login` redirection.
* **🛡️ Defensive API Engine:** Centralized HTTP handling with custom error boundaries to handle rate limits (`429`), upstream timeouts (`504`), and non-deterministic JSON responses (`502`).
* **📦 Monorepo Deployment Ready:** Pre-configured for independent serverless deployments on Vercel or alternative cloud platforms.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18
* **Routing:** React Router v6
* **Data Visualization:** Recharts
* **Styling & UI:** Custom CSS / Component Modules

### **Backend**
* **Runtime:** Node.js & Express.js
* **AI Service:** Google Gemini API (`@google/genai` / REST integrations)
* **Configuration:** Centralized `env.js` config & custom middleware

---

## 📁 Repository Structure

```text
coretask/
├── frontend/                   # React Client Application
│   ├── src/
│   │   ├── api/                # Client fetch abstractions & AI endpoints
│   │   ├── components/         # Dashboard, Task Cards, & Visual Analytics
│   │   ├── pages/              # Login & Dashboard page views
│   │   ├── App.jsx             # Routing configuration & auth hooks
│   │   └── index.js            # React entry point
│   └── package.json
│
├── backend/                    # Node.js / Express API Server
│   ├── config/                 # Environment variables & setup
│   ├── controllers/            # Request handlers (AI, Tasks, Projects)
│   ├── routes/                 # Express REST endpoint declarations
│   ├── services/               # Gemini AI prompt handlers & JSON parsers
│   ├── index.js                # Express app entry point
│   └── package.json
│
└── README.md
