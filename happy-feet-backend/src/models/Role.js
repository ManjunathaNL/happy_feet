const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Role name cannot exceed 100 characters"],
    },
    
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Case-insensitive unique name
RoleSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Role", RoleSchema);