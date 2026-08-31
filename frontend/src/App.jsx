import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { TOKENS, FONT_BODY, FONT_DISPLAY } from "./constants/tokens";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./components/GlobalStyles";
import LoginPage from "./components/auth/LoginPage";
import TopBar from "./components/nav/TopBar";
import Sidebar from "./components/nav/Sidebar";
import DashboardHome from "./components/dashboard/DashboardHome";
import ProjectsSection from "./components/dashboard/ProjectsSection";
import TasksSection from "./components/dashboard/TasksSection";
import ReportsPage from "./components/dashboard/ReportsPage";

// Full-screen spinner shown only for the brief moment while we check
// localStorage for an existing session on first load.
function SplashScreen() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ background: TOKENS.bg }}>
      <Loader2 size={22} className="animate-spin" style={{ color: TOKENS.accent }} />
    </div>
  );
}

// Decides between the login screen and the real app based on auth status.
// Kept separate from DashboardApp so useAuth() can be called safely —
// this component renders *inside* AuthProvider, DashboardApp does not need
// to know about auth state at all beyond what its children already do.
function AuthGate() {
  const { status } = useAuth();

  if (status === "loading") return <SplashScreen />;
  if (status === "guest") return <LoginPage />;
  return <DashboardApp />;
}

function DashboardApp() {
  const [activeNav, setActiveNav] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: TOKENS.bg, fontFamily: FONT_BODY }}>
      <TopBar onMenuClick={() => setMobileOpen(true)} search={search} setSearch={setSearch} activeNav={activeNav} />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="flex-1 min-w-0 px-4 py-5 md:px-8 md:py-8 max-w-[1400px] mx-auto w-full">
          {activeNav === "home" && <DashboardHome search={search} />}
          {activeNav === "projects" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
                Projects
              </h1>
              <ProjectsSection search={search} />
            </div>
          )}
          {activeNav === "tasks" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
                Tasks
              </h1>
              <TasksSection search={search} />
            </div>
          )}
          {activeNav === "reports" && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <AuthGate />
    </AuthProvider>
  );
}


