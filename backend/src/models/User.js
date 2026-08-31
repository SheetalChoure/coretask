const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["admin", "member"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [2, "name must be at least 2 characters"],
      maxlength: [80, "name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      // Enforced at the DB level, in addition to the app-level pre-check
      // in the controller — the unique index is the real guarantee under
      // concurrent requests; the pre-check just gives a friendlier error
      // in the common case.
      unique: true,
      match: [EMAIL_REGEX, "must be a valid email address"],
    },
    password: {
      // Only ever stores a bcrypt hash, never plaintext — hashing happens
      // in the controller before this is set. select:false keeps it out
      // of normal query results by default; callers that need it (login)
      // opt in with .select("+password").
      type: String,
      required: [true, "password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: { values: ROLES, message: `role must be one of: ${ROLES.join(", ")}` },
      default: "member",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
