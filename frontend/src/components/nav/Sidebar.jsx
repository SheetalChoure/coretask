import React, { useState, useEffect } from "react";
import { X, Home, FolderKanban, ListChecks, BarChart3 } from "lucide-react";
import { TOKENS, FONT_DISPLAY, STATUS_META } from "../../constants/tokens";
import { useAuth } from "../../context/AuthContext";
import * as projectsApi from "../../api/projects";
import Avatar from "../primitives/Avatar";

// Icon lookup kept local to the sidebar — edit here to change nav icons
const NAV_ITEMS = [
  { key: "home", label: "Dashboard", icon: Home },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

function initialsFor(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function SidebarContent({ activeNav, setActiveNav }) {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    projectsApi.listProjects().then((all) => setRecentProjects(all.slice(0, 4))).catch(() => setRecentProjects([]));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors relative"
              style={{ background: active ? TOKENS.accentSoft : "transparent", color: active ? TOKENS.accent : TOKENS.textMuted }}
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={17} />
              {item.label}
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ background: TOKENS.accent }} />}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 px-3">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: TOKENS.textFaint }}>
          Your projects
        </p>
        <div className="flex flex-col gap-0.5">
          {recentProjects.map((p) => (
            <button
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors truncate text-left"
              style={{ color: TOKENS.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.surfaceAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span
                className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: TOKENS[STATUS_META[p.status]?.tone] || TOKENS.textFaint }}
              />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          {recentProjects.length === 0 && (
            <p className="px-3 text-[11.5px]" style={{ color: TOKENS.textFaint }}>No projects yet</p>
          )}
        </div>
      </div>

      <div className="mt-auto p-3">
        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.border}` }}>
          <Avatar initials={initialsFor(user?.name)} size={34} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium truncate" style={{ color: TOKENS.text }}>{user?.name}</p>
            <p className="text-[11px] truncate" style={{ color: TOKENS.textFaint }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ activeNav, setActiveNav, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop / tablet persistent sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r" style={{ background: TOKENS.bg, borderColor: TOKENS.border }}>
        <SidebarContent activeNav={activeNav} setActiveNav={setActiveNav} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r" style={{ background: TOKENS.bg, borderColor: TOKENS.border }}>
            <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: TOKENS.border }}>
              <span className="font-semibold text-[15px]" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>devpulse</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-lg w-8 h-8"
                style={{ background: TOKENS.surface, color: TOKENS.textMuted }}
                aria-label="Close navigation menu"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent activeNav={activeNav} setActiveNav={(k) => { setActiveNav(k); setMobileOpen(false); }} />
          </div>
        </div>
      )}
    </>
  );
}

export { NAV_ITEMS };
