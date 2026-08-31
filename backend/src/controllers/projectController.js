const store = require("../db/store");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

async function serializeProject(project) {
  const [counts, owner, members] = await Promise.all([
    store.projects.taskCounts(project.id),
    store.users.findById(project.ownerId),
    Promise.all((project.memberIds || []).map((id) => store.users.findById(id))),
  ]);

  return {
    ...project,
    owner: store.toUserSummary(owner),
    members: members.filter(Boolean).map(store.toUserSummary),
    taskCounts: counts,
    progress: counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0,
  };
}

async function assertMembersExist(memberIds = []) {
  const found = await Promise.all(memberIds.map((id) => store.users.findById(id)));
  const missing = memberIds.filter((id, i) => !found[i]);
  if (missing.length > 0) {
    throw AppError.badRequest("memberIds contains ids that don't match any existing user.", [
      { field: "memberIds", message: `no user found for: ${missing.join(", ")}` },
    ]);
  }
}

function checkProjectAccess(project, user) {
  if (user.role === "admin") return true;
  const isOwner = project.ownerId.toString() === user.id.toString();
  const isMember = (project.memberIds || []).some((mId) => mId.toString() === user.id.toString());
  return isOwner || isMember;
}

const create = catchAsync(async (req, res) => {
  await assertMembersExist(req.body.memberIds);
  const project = await store.projects.create({ ...req.body, ownerId: req.user.id });
  return sendSuccess(res, { statusCode: 201, message: "Project created.", data: { project: await serializeProject(project) } });
});

const list = catchAsync(async (req, res) => {
  const { page, limit } = req.query;

  // Pass filter as an object to match store.projects.list({ userId, ownerId })
  const userIdFilter = req.user.role === "admin" ? null : req.user.id;
  const all = await store.projects.list({ userId: userIdFilter });

  const start = (page - 1) * limit;
  const pageItems = await Promise.all(all.slice(start, start + limit).map(serializeProject));

  return sendSuccess(res, {
    data: { projects: pageItems },
    meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) || 1 },
  });
});

const getById = catchAsync(async (req, res) => {
  const project = await store.projects.findById(req.params.id);
  if (!project) throw AppError.notFound("Project not found.");

  if (!checkProjectAccess(project, req.user)) {
    throw AppError.forbidden("You do not have access to this project.");
  }

  return sendSuccess(res, { data: { project: await serializeProject(project) } });
});

const update = catchAsync(async (req, res) => {
  const project = await store.projects.findById(req.params.id);
  if (!project) throw AppError.notFound("Project not found.");

  if (project.ownerId !== req.user.id && req.user.role !== "admin") {
    throw AppError.forbidden("Only the project owner or an admin can update this project.");
  }

  await assertMembersExist(req.body.memberIds);

  const updated = await store.projects.update(project.id, req.body);
  return sendSuccess(res, { data: { project: await serializeProject(updated) }, message: "Project updated." });
});

const remove = catchAsync(async (req, res) => {
  const project = await store.projects.findById(req.params.id);
  if (!project) throw AppError.notFound("Project not found.");

  if (project.ownerId !== req.user.id && req.user.role !== "admin") {
    throw AppError.forbidden("Only the project owner or an admin can delete this project.");
  }

  const { total } = await store.projects.taskCounts(project.id);
  if (total > 0 && req.query.force !== "true") {
    throw AppError.conflict(
      `This project still has ${total} task(s). Delete them first, or retry with ?force=true to delete them along with the project.`,
      { taskCount: total }
    );
  }

  await store.tasks.removeByProject(project.id);
  await store.projects.remove(project.id);
  return sendSuccess(res, { message: "Project deleted.", data: null });
});

module.exports = { create, list, getById, update, remove };


