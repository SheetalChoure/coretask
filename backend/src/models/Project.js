const mongoose = require("mongoose");

const STATUSES = ["active", "on-hold", "completed", "archived"];

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [2, "name must be at least 2 characters"],
      maxlength: [120, "name must be at most 120 characters"],
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
      default: "active",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: "a project can have at most 8 tags",
      },
    },
    dueDate: { type: Date, default: null },

    // --- Relationships ---
    // A project belongs to exactly one owner and has zero or more members.
    // `ref: "User"` is what makes .populate("ownerId") / .populate("memberIds")
    // work, and is how Mongoose models the relationship at the schema level.
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ownerId is required"],
      index: true,
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
module.exports.STATUSES = STATUSES;
