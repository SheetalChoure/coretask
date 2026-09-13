import React, { useState } from "react";
import { Search, Bell, Menu, GitBranch, ChevronDown, Settings, LogOut } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../primitives/Avatar";

// Fallback initials if a user object doesn't provide any (shouldn't happen
// once logged in, but keeps Avatar from crashing during the brief render
// before auth state settles).
function initialsFor(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function TopBar({ onMenuClick, search, setSearch, activeNav }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-16 border-b backdrop-blur-md"
      style={{ background: `${TOKENS.bg}E8`, borderColor: TOKENS.border }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center rounded-lg w-9 h-9 shrink-0"
        style={{ background: TOKENS.surface, color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 shrink-0 mr-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: TOKENS.accentSoft, color: TOKENS.accent }}
        >
          <GitBranch size={16} />
        </div>
        <span className="hidden sm:block font-semibold text-[15px] tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
          CoreTask
        </span>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TOKENS.textFaint }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeNav === "tasks" ? "tasks" : "projects"}…`}
          aria-label="Search"
          className="w-full rounded-lg pl-9 pr-3 py-2 text-[13px] outline-none transition-shadow"
          style={{ background: TOKENS.surface, color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${TOKENS.accentSoft}`)}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className="relative flex items-center justify-center rounded-lg w-9 h-9"
          style={{ background: TOKENS.surface, color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 rounded-full" style={{ width: 8, height: 8, background: TOKENS.danger, border: `2px solid ${TOKENS.bg}` }} />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1"
            style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <Avatar initials={initialsFor(user?.name)} size={28} />
            <ChevronDown size={14} style={{ color: TOKENS.textMuted }} />
          </button>
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-xl p-1.5 shadow-2xl z-40"
              style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.borderStrong}` }}
            >
              <div className="px-2.5 py-2 mb-1 border-b" style={{ borderColor: TOKENS.border }}>
                <p className="text-[13px] font-medium" style={{ color: TOKENS.text }}>{user?.name}</p>
                <p className="text-[11px]" style={{ color: TOKENS.textFaint }}>{user?.role}</p>
              </div>
              <button
                className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors"
                style={{ color: TOKENS.textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Settings size={14} /> Settings
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors"
                style={{ color: TOKENS.textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
