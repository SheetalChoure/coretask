const mongoose = require("mongoose");

const STATUSES = ["todo", "in-progress", "done"];
const PRIORITIES = ["low", "medium", "high"];

// Kept as a subdocument (not its own collection) since a status history
// entry only ever makes sense in the context of its parent task, and is
// always read/written together with it. { _id: false } keeps the API
// response free of a meaningless per-entry id.
const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: [2, "title must be at least 2 characters"],
      maxlength: [160, "title must be at most 160 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "description must be at most 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: `status must be one of: ${STATUSES.join(", ")}` },
      default: "todo",
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: `priority must be one of: ${PRIORITIES.join(", ")}` },
      default: "medium",
    },
    dueDate: { type: Date, default: null },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: () => [{ status: "todo", changedAt: new Date() }],
    },

    // --- Relationships ---
    // Every task belongs to exactly one project (required — a task can't
    // float without a parent) and is optionally assigned to one user.
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "projectId is required"],
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
