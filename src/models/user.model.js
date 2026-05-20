import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // =========================
    // NAME
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // EMAIL
    // =========================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================
    // PASSWORD
    // =========================
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // AVATAR (🔥 IMPORTANT FIX)
    // =========================
    avatar: {
      public_id: {
        type: String,
        default: "",
      },

      url: {
        type: String,
        default: "",
      },
    },

    // =========================
    // ROLE
    // =========================
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =========================
    // BLOCK STATUS
    // =========================
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// HASH PASSWORD
// =========================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// =========================
// COMPARE PASSWORD
// =========================
userSchema.methods.comparePassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

const User = mongoose.model(
  "User",
  userSchema
);

export default User;