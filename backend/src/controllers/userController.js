const bcrypt = require("bcryptjs");
const store = require("../db/store");
const config = require("../config/env");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const { signToken } = require("../utils/tokens");

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await store.users.findByEmail(email)) {
    throw AppError.conflict("An account with this email already exists.");
  }

  const hashed = await bcrypt.hash(password, config.bcryptSaltRounds);
  const user = await store.users.create({ name, email, password: hashed, role });
  const token = signToken({ sub: user.id, role: user.role });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Account created.",
    data: { user: store.toPublicUser(user), token },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await store.users.findByEmail(email);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatches) {
    // Deliberately identical message for "no such user" and "wrong password"
    // so the API doesn't reveal which emails are registered.
    throw AppError.unauthorized("Invalid email or password.");
  }

  const token = signToken({ sub: user.id, role: user.role });
  return sendSuccess(res, {
    data: { user: store.toPublicUser(user), token },
    message: "Logged in.",
  });
});

const me = catchAsync(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } });
});

const list = catchAsync(async (req, res) => {
  const users = (await store.users.list()).map(store.toPublicUser);
  return sendSuccess(res, { data: { users }, meta: { count: users.length } });
});

const getById = catchAsync(async (req, res) => {
  const user = await store.users.findById(req.params.id);
  if (!user) throw AppError.notFound("User not found.");
  return sendSuccess(res, { data: { user: store.toPublicUser(user) } });
});

const update = catchAsync(async (req, res) => {
  const target = await store.users.findById(req.params.id);
  if (!target) throw AppError.notFound("User not found.");

  const isSelf = req.user.id === target.id;
  if (!isSelf && req.user.role !== "admin") {
    throw AppError.forbidden("You can only update your own account.");
  }

  if (req.body.email && req.body.email.toLowerCase() !== target.email) {
    const existing = await store.users.findByEmail(req.body.email);
    if (existing) throw AppError.conflict("An account with this email already exists.");
  }

  // Only admins may change roles
  if (req.body.role && req.user.role !== "admin") {
    throw AppError.forbidden("Only an admin can change a user's role.");
  }

  const updated = await store.users.update(target.id, req.body);
  return sendSuccess(res, { data: { user: store.toPublicUser(updated) }, message: "User updated." });
});

const remove = catchAsync(async (req, res) => {
  const target = await store.users.findById(req.params.id);
  if (!target) throw AppError.notFound("User not found.");

  const isSelf = req.user.id === target.id;
  if (!isSelf && req.user.role !== "admin") {
    throw AppError.forbidden("You can only delete your own account.");
  }

  await store.users.remove(target.id);
  return sendSuccess(res, { statusCode: 200, message: "User deleted.", data: null });
});

module.exports = { register, login, me, list, getById, update, remove };
