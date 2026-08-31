const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/env");
const { initialsFromName } = require("../utils/initials");

const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

const TASK_STATUSES = Task.STATUSES;
const TASK_PRIORITIES = Task.PRIORITIES;
const USER_ROLES = User.ROLES;

function isValidId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

function serialize(doc, refFields = []) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  const plain = { id: String(_id), ...rest };
  for (const field of refFields) {
    if (Array.isArray(plain[field])) {
      plain[field] = plain[field].map(String);
    } else if (plain[field] != null) {
      plain[field] = String(plain[field]);
    }
  }
  return plain;
}

/* ------------------------------- Users -------------------------------- */

function toPublicUser(user) {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

function toUserSummary(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, initials: initialsFromName(user.name) };
}

async function findUserByEmail(email) {
  const doc = await User.findOne({ email: email.toLowerCase().trim() }).select("+password").lean();
  return serialize(doc);
}

async function findUserById(userId) {
  if (!isValidId(userId)) return null;
  const doc = await User.findById(userId).lean();
  return serialize(doc);
}

async function listUsers() {
  const docs = await User.find().lean();
  return docs.map((d) => serialize(d));
}

async function createUser({ name, email, password, role = "member" }) {
  const doc = await User.create({ name, email, password, role });
  return serialize(doc.toObject());
}

async function updateUser(userId, patch) {
  if (!isValidId(userId)) return null;
  const doc = await User.findByIdAndUpdate(userId, patch, { new: true, runValidators: true }).lean();
  return serialize(doc);
}

async function deleteUser(userId) {
  if (!isValidId(userId)) return false;
  const res = await User.findByIdAndDelete(userId);
  return Boolean(res);
}

/* ------------------------------ Projects ------------------------------ */

const PROJECT_REF_FIELDS = ["ownerId", "memberIds"];

async function listProjects({ userId, ownerId } = {}) {
  const filter = {};

  if (userId && isValidId(userId)) {
    filter.$or = [{ ownerId: userId }, { memberIds: userId }];
  } else if (ownerId && isValidId(ownerId)) {
    filter.ownerId = ownerId;
  }

  const docs = await Project.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map((d) => serialize(d, PROJECT_REF_FIELDS));
}

async function findProjectById(projectId) {
  if (!isValidId(projectId)) return null;
  const doc = await Project.findById(projectId).lean();
  return serialize(doc, PROJECT_REF_FIELDS);
}

async function createProject({ name, description, ownerId, status = "active", tags = [], dueDate = null, memberIds = [] }) {
  const doc = await Project.create({
    name,
    description,
    status,
    tags,
    dueDate,
    ownerId,
    memberIds: [...new Set([String(ownerId), ...memberIds.map(String)])],
  });
  return serialize(doc.toObject(), PROJECT_REF_FIELDS);
}

async function updateProject(projectId, patch) {
  if (!isValidId(projectId)) return null;

  if (patch.memberIds) {
    const existing = await Project.findById(projectId).select("ownerId").lean();
    if (!existing) return null;
    patch = { ...patch, memberIds: [...new Set([String(existing.ownerId), ...patch.memberIds.map(String)])] };
  }

  const doc = await Project.findByIdAndUpdate(projectId, patch, { new: true, runValidators: true }).lean();
  return serialize(doc, PROJECT_REF_FIELDS);
}

async function deleteProject(projectId) {
  if (!isValidId(projectId)) return false;
  const res = await Project.findByIdAndDelete(projectId);
  return Boolean(res);
}

async function projectTaskCounts(projectId) {
  const [total, todo, inProgress, done] = await Promise.all([
    Task.countDocuments({ projectId }),
    Task.countDocuments({ projectId, status: "todo" }),
    Task.countDocuments({ projectId, status: "in-progress" }),
    Task.countDocuments({ projectId, status: "done" }),
  ]);
  return { total, todo, inProgress, done };
}

/* -------------------------------- Tasks -------------------------------- */

const TASK_REF_FIELDS = ["projectId", "assigneeId"];

async function listTasks({ userId, projectId, accessibleProjectIds, status, priority, assigneeId, search } = {}) {
  const filter = {};

  if (projectId && isValidId(projectId)) {
    filter.projectId = projectId;
  } else if (Array.isArray(accessibleProjectIds)) {
    filter.projectId = { $in: accessibleProjectIds.filter(isValidId) };
  } else if (userId && isValidId(userId)) {
    const userProjects = await Project.find({
      $or: [{ ownerId: userId }, { memberIds: userId }],
    }).select("_id").lean();

    filter.projectId = { $in: userProjects.map((p) => p._id) };
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assigneeId && isValidId(assigneeId)) filter.assigneeId = assigneeId;

  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") }
    ];
  }

  const docs = await Task.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map((d) => serialize(d, TASK_REF_FIELDS));
}

async function findTaskById(taskId) {
  if (!isValidId(taskId)) return null;
  const doc = await Task.findById(taskId).lean();
  return serialize(doc, TASK_REF_FIELDS);
}

async function createTask({ title, description, projectId, assigneeId, priority = "medium", dueDate = null }) {
  const doc = await Task.create({
    title,
    description,
    projectId,
    assigneeId: assigneeId || null,
    priority,
    dueDate,
    status: "todo",
    statusHistory: [{ status: "todo", changedAt: new Date() }],
  });
  return serialize(doc.toObject(), TASK_REF_FIELDS);
}

async function updateTask(taskId, patch) {
  if (!isValidId(taskId)) return null;
  const doc = await Task.findByIdAndUpdate(taskId, patch, { new: true, runValidators: true }).lean();
  return serialize(doc, TASK_REF_FIELDS);
}

async function setTaskStatus(taskId, status) {
  if (!isValidId(taskId)) return null;
  const doc = await Task.findByIdAndUpdate(
    taskId,
    { status, $push: { statusHistory: { status, changedAt: new Date() } } },
    { new: true, runValidators: true }
  ).lean();
  return serialize(doc, TASK_REF_FIELDS);
}

async function deleteTask(taskId) {
  if (!isValidId(taskId)) return false;
  const res = await Task.findByIdAndDelete(taskId);
  return Boolean(res);
}

async function deleteTasksByProject(projectId) {
  if (!isValidId(projectId)) return 0;
  const res = await Task.deleteMany({ projectId });
  return res.deletedCount || 0;
}

/* -------------------------------- Seed --------------------------------- */

async function seedIfEmpty() {
  const existing = await User.countDocuments();
  if (existing > 0) return;

  const hash = (pw) => bcrypt.hashSync(pw, config.bcryptSaltRounds);

  const admin = await User.create({ name: "Ada Admin", email: "admin@taskflow.dev", password: hash("Password123!"), role: "admin" });
  const priya = await User.create({ name: "Priya Nair", email: "priya@taskflow.dev", password: hash("Password123!"), role: "member" });
  const raj = await User.create({ name: "Raj Kumar", email: "raj@taskflow.dev", password: hash("Password123!"), role: "member" });

  const gateway = await Project.create({
    name: "Payments Gateway v3",
    description: "Migrate settlement pipeline to event-driven architecture.",
    ownerId: priya._id,
    tags: ["backend", "critical"],
    dueDate: new Date("2026-09-04"),
    memberIds: [priya._id, raj._id],
  });
  const ds = await Project.create({
    name: "Design System 2.0",
    description: "Unify component tokens across web and mobile clients.",
    ownerId: admin._id,
    tags: ["frontend", "design"],
    dueDate: new Date("2026-09-18"),
    memberIds: [admin._id, priya._id],
  });

  await Task.create({ title: "Add idempotency keys to settlement writes", projectId: gateway._id, assigneeId: priya._id, priority: "high" });
  await Task.create({ title: "Write migration rollback runbook", projectId: gateway._id, assigneeId: raj._id, priority: "medium" });
  await Task.create({
    title: "Ship button + input token audit",
    projectId: ds._id,
    assigneeId: admin._id,
    priority: "medium",
    status: "in-progress",
    statusHistory: [{ status: "todo", changedAt: new Date() }, { status: "in-progress", changedAt: new Date() }],
  });

  // eslint-disable-next-line no-console
  console.log("[db] Seeded demo data (3 users, 2 projects, 3 tasks).");
}

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  USER_ROLES,
  toPublicUser,
  toUserSummary,
  seedIfEmpty,
  users: {
    findByEmail: findUserByEmail,
    findById: findUserById,
    list: listUsers,
    create: createUser,
    update: updateUser,
    remove: deleteUser,
  },
  projects: {
    findById: findProjectById,
    list: listProjects,
    create: createProject,
    update: updateProject,
    remove: deleteProject,
    taskCounts: projectTaskCounts,
  },
  tasks: {
    findById: findTaskById,
    list: listTasks,
    create: createTask,
    update: updateTask,
    setStatus: setTaskStatus,
    remove: deleteTask,
    removeByProject: deleteTasksByProject,
  },
};


