import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    Employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isProjectDoneByEmployer: {
      type: Boolean,
      default: false,
    },
    isProjectDoneByFreelancer: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
