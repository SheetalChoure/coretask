# devpulse — Developer Productivity Dashboard

A component-based React dashboard, split into small, independently editable files.

## Run it

```bash
npm install
npm run dev
```

## File structure

```
src/
  constants/
    tokens.js            → colors, fonts, shared status/priority lookups. Re-theme the app here.
  data/
    mockData.js          → all mock data (user, projects, tasks, filters). Swap for real API calls.

  components/
    GlobalStyles.jsx      → font import + global CSS (scrollbars, focus rings, reduced-motion)

    primitives/            small, dumb, reusable building blocks
      Badge.jsx
      ProgressBar.jsx
      Avatar.jsx

    states/                 loading / empty / error UI, reused everywhere
      EmptyState.jsx
      ErrorState.jsx
      Skeletons.jsx        → ProjectCardSkeleton, TaskRowSkeleton

    nav/
      TopBar.jsx           → search, notifications, profile menu, mobile menu button
      Sidebar.jsx          → nav links + your-projects list + mobile drawer

    dashboard/
      SectionHeader.jsx    → shared "icon + title + count + action" row
      FilterBar.jsx        → shared filter chips + optional sort dropdown
      StatsOverview.jsx    → the 4 top stat cards
      ActivityHeatmap.jsx  → commit-style contribution graph (signature element)
      ProjectCard.jsx      → single project card
      ProjectsSection.jsx  → owns projects fetch/loading/empty/error/filter state
      TaskRow.jsx          → single task row
      TasksSection.jsx     → owns tasks fetch/loading/empty/error/filter/sort state
      SideRailWidgets.jsx  → ProfileSummary + WeeklyStats side-rail cards
      SimplePlaceholder.jsx→ generic "nothing here yet" view for other nav tabs
      DashboardHome.jsx    → composes the sections above into the home view

  App.jsx                  → top-level layout: TopBar + Sidebar + routed main content
  index.jsx / index.css    → Vite/React entry point + Tailwind directives
```

## Common edits

- **Change colors / fonts:** `src/constants/tokens.js`
- **Point at a real API:** replace `fetchProjects()` in `ProjectsSection.jsx` and
  `fetchTasks()` in `TasksSection.jsx` with real requests. Keep the same
  `loading → ready/empty` / `.catch(() => setState("error"))` contract and every
  other component keeps working unmodified.
- **Add a nav tab:** add an entry to `NAV_ITEMS` in `Sidebar.jsx`, then render a
  new view in `App.jsx`'s `<main>` switch.
- **Add a stat card:** edit the array in `StatsOverview.jsx`.
- **Add a side-rail widget:** add a new component to `SideRailWidgets.jsx` and
  drop it into `DashboardHome.jsx`.
