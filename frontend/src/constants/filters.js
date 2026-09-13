// Filter chip options shown in the UI — kept separate from mock data since
// these are real, permanent constants matching the API's Project.status
// and Task.status/priority enums (see backend src/models/*.js).

export const PROJECT_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "on-hold", label: "On hold" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export const TASK_FILTERS = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "done", label: "Done" },
];
