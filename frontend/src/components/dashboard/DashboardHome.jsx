import React, { useState, useEffect } from "react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";
import { useAuth } from "../../context/AuthContext";
import StatsOverview from "./StatsOverview";
import ActivityHeatmap from "./ActivityHeatmap";
import ProjectsSection from "./ProjectsSection";
import TasksSection from "./TasksSection";
import { ProfileSummary, WeeklyStats } from "./SideRailWidgets";
import * as projectsApi from "../../api/projects";
import * as tasksApi from "../../api/tasks";

export default function DashboardHome({ search }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const [statsData, setStatsData] = useState({ projects: [], tasks: [] });

  // Re-run whenever user.id changes (handles log in / log out / user switch)
  useEffect(() => {
    if (!user) {
      setStatsData({ projects: [], tasks: [] });
      return;
    }

    Promise.all([projectsApi.listProjects(), tasksApi.listAllTasks()])
      .then(([projects, tasks]) => setStatsData({ projects, tasks }))
      .catch(() => setStatsData({ projects: [], tasks: [] }));
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-1" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
          Good to see you, {firstName}
        </h1>
        <p className="text-[13px] mb-5" style={{ color: TOKENS.textMuted }}>
          Here's where your projects and tasks stand today.
        </p>
        <StatsOverview projects={statsData.projects} tasks={statsData.tasks} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 md:gap-8 items-start">
        <div className="flex flex-col gap-6 md:gap-8 min-w-0">
          <ProjectsSection search={search} />
          <TasksSection search={search} />
        </div>

        <div className="flex flex-col gap-4 xl:sticky xl:top-20">
          <ProfileSummary />
          <ActivityHeatmap />
          <WeeklyStats />
        </div>
      </div>
    </div>
  );
}


