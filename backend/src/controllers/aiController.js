const store = require("../db/store");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const aiService = require("../services/aiService");

// Suggests tasks for an existing project. Nothing is persisted — the
// client shows these as checkable suggestions and calls acceptTasks with
// whichever ones the user actually wants to keep.
const suggestTasks = catchAsync(async (req, res) => {
  const project = await store.projects.findById(req.params.projectId);
  if (!project) throw AppError.notFound("Project not found.");

  const { goal, count } = req.body;
  const suggestions = await aiService.generateTaskSuggestions({
    projectName: project.name,
    projectDescription: project.description,
    goal,
    count,
  });

  return sendSuccess(res, { data: { suggestions } });
});

// Bulk-creates whichever suggested (or hand-edited) tasks the client sends
// back. Reuses the same store function a normal "create task" call would,
// so these end up completely indistinguishable from manually created tasks.
const acceptTasks = catchAsync(async (req, res) => {
  const project = await store.projects.findById(req.params.projectId);
  if (!project) throw AppError.notFound("Project not found.");

  const created = [];
  for (const t of req.body.tasks) {
    if (t.assigneeId && !(await store.users.findById(t.assigneeId))) {
      throw AppError.badRequest("assigneeId does not match any existing user.", [
        { field: "assigneeId", message: `no user found for: ${t.assigneeId}` },
      ]);
    }
    const task = await store.tasks.create({ ...t, projectId: project.id });
    created.push(task);
  }

  return sendSuccess(res, { statusCode: 201, message: `${created.length} task(s) created.`, data: { tasks: created } });
});

// Standalone helper used while creating a new project (no project exists
// yet), so this isn't nested under /projects/:projectId.
const generateDescription = catchAsync(async (req, res) => {
  const { name, keywords } = req.body;
  const description = await aiService.generateProjectDescription({ name, keywords });
  return sendSuccess(res, { data: { description } });
});

module.exports = { suggestTasks, acceptTasks, generateDescription };
