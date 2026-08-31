# CoreTask — React Frontend Interface

A modern, high-performance React dashboard for project tracking, visual analytics, and AI-assisted task management Features

* **AI Task Suggestions & Breakdown:** Generate task suggestions based on project goals and decompose large tasks into actionable subtasks with estimated completion times.
* **Interactive Data Visualization:** Comprehensive reporting pages built with `recharts` for analyzing completion trends and task priority distributions.
* **Auth-Guarded Routing:** Integrated navigation logic that redirects unauthenticated users to `/login` automatically.
* **Robust Error Handling:** Resilient client handling for AI service timeouts (504), rate limits (429), and structure parsing errors (502).

---

## 📁 Folder Structure

```text
frontend/
├── src/
│   ├── api/                    # API client abstraction & fetch wrappers
│   │   ├── client.js           # Base apiFetch implementation
│   │   └── ai.js               # AI feature endpoint abstractions
│   ├── components/
│   │   └── dashboard/          # Dashboard components
│   │       ├── DashboardHome.jsx     # Overview & user task stats
│   │       ├── ProjectsSection.jsx   # Project list & creation
│   │       ├── ReportsPage.jsx       # Analytics powered by Recharts
│   │       └── TaskCard.jsx          # Interactive task item with AI subtasks
│   ├── pages/                  # Page-level route views (LoginPage, DashboardPage)
│   ├── App.jsx                 # Main entry routing & protected route logic
│   └── index.js                # React DOM mount point
├── package.json
└── README.md
