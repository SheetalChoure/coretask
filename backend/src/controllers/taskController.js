const store = require("../db/store");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

async function assertAssigneeExists(assigneeId) {
  if (assigneeId && !(await store.users.findById(assigneeId))) {
    throw AppError.badRequest("assigneeId does not match any existing user.", [
      { field: "assigneeId", message: "no user found with this id" },
    ]);
  }
}

async function serializeTask(task) {
  const assignee = task.assigneeId ? await store.users.findById(task.assigneeId) : null;
  return { ...task, assignee: store.toUserSummary(assignee) };
}

async function assertProjectAccess(projectId, user) {
  const project = await store.projects.findById(projectId);
  if (!project) throw AppError.notFound("Project not found.");

  if (user.role === "admin") return project;

  const isOwner = project.ownerId.toString() === user.id.toString();
  const isMember = (project.memberIds || []).some((mId) => mId.toString() === user.id.toString());

  if (!isOwner && !isMember) {
    throw AppError.forbidden("You do not have permission to access tasks for this project.");
  }
  return project;
}

const create = catchAsync(async (req, res) => {
  await assertProjectAccess(req.params.projectId, req.user);
  await assertAssigneeExists(req.body.assigneeId);

  const task = await store.tasks.create({ ...req.body, projectId: req.params.projectId });
  return sendSuccess(res, { statusCode: 201, message: "Task created.", data: { task: await serializeTask(task) } });
});

const listForProject = catchAsync(async (req, res) => {
  await assertProjectAccess(req.params.projectId, req.user);

  const { status, priority, assigneeId, search, page, limit } = req.query;
  const all = await store.tasks.list({ projectId: req.params.projectId, status, priority, assigneeId, search });

  const start = (page - 1) * limit;
  const pageItems = await Promise.all(all.slice(start, start + limit).map(serializeTask));

  return sendSuccess(res, {
    data: { tasks: pageItems },
    meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) || 1 },
  });
});

const listAll = catchAsync(async (req, res) => {
  const { projectId, status, priority, assigneeId, search, page, limit } = req.query;

  let accessibleProjectIds;

  // Non-admins are scoped to tasks inside projects they own or belong to
  if (req.user.role !== "admin") {
    const userProjects = await store.projects.list({ userId: req.user.id });
    accessibleProjectIds = userProjects.map((p) => p.id);
  }

  const userIdFilter = req.user.role === "admin" ? null : req.user.id;
  const all = await store.tasks.list({
    userId: userIdFilter,
    projectId,
    accessibleProjectIds,
    status,
    priority,
    assigneeId,
    search,
  });

  const start = (page - 1) * limit;
  const pageItems = await Promise.all(all.slice(start, start + limit).map(serializeTask));

  return sendSuccess(res, {
    data: { tasks: pageItems },
    meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) || 1 },
  });
});

const getById = catchAsync(async (req, res) => {
  const task = await store.tasks.findById(req.params.id);
  if (!task) throw AppError.notFound("Task not found.");

  await assertProjectAccess(task.projectId, req.user);
  return sendSuccess(res, { data: { task: await serializeTask(task) } });
});

const update = catchAsync(async (req, res) => {
  const task = await store.tasks.findById(req.params.id);
  if (!task) throw AppError.notFound("Task not found.");

  await assertProjectAccess(task.projectId, req.user);
  await assertAssigneeExists(req.body.assigneeId);

  const updated = await store.tasks.update(task.id, req.body);
  return sendSuccess(res, { data: { task: await serializeTask(updated) }, message: "Task updated." });
});

const ALLOWED_TRANSITIONS = {
  todo: ["in-progress"],
  "in-progress": ["todo", "done"],
  done: ["in-progress"],
};

const updateStatus = catchAsync(async (req, res) => {
  const task = await store.tasks.findById(req.params.id);
  if (!task) throw AppError.notFound("Task not found.");

  await assertProjectAccess(task.projectId, req.user);

  const { status: nextStatus } = req.body;

  if (nextStatus === task.status) {
    return sendSuccess(res, { data: { task: await serializeTask(task) }, message: "Task status unchanged." });
  }

  const allowed = ALLOWED_TRANSITIONS[task.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw AppError.badRequest(
      `Cannot move task from "${task.status}" to "${nextStatus}".`,
      [{ field: "status", message: `allowed next values from "${task.status}": ${allowed.join(", ") || "none"}` }]
    );
  }

  const updated = await store.tasks.setStatus(task.id, nextStatus);
  return sendSuccess(res, { data: { task: await serializeTask(updated) }, message: `Task moved to "${nextStatus}".` });
});

const remove = catchAsync(async (req, res) => {
  const task = await store.tasks.findById(req.params.id);
  if (!task) throw AppError.notFound("Task not found.");

  await assertProjectAccess(task.projectId, req.user);

  await store.tasks.remove(task.id);
  return sendSuccess(res, { message: "Task deleted.", data: null });
});

module.exports = { create, listForProject, listAll, getById, update, updateStatus, remove };
