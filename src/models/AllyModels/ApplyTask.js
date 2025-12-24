import mongoose from "mongoose";

const applyTaskSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostTaskModel",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllyProfileModel",   // Ally
      required: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostProfileModel",   // Host
      required: true,
    },

    coverMessage: {
      type: String,
      trim: true,
      maxLength: 500,
    },

    // proposedAmount: {
    //   type: Number,
    //   min: 0,
    // },

    status: {
      type: String,
      enum: ["applied", "accepted", "rejected", "cancelled", "completed"],
      default: "applied",
    },

    // optional info about selection/work
    selectedAt: Date,
    completedAt: Date,

    // rating system (optional but powerful!)
    // hostRatingForAlly: {
    //   type: Number,
    //   min: 1,
    //   max: 5,
    // },
    // allyRatingForHost: {
    //   type: Number,
    //   min: 1,
    //   max: 5,
    // },
  },
  { timestamps: true }
);

applyTaskSchema.index({ task: 1, applicant: 1 }, { unique: true });

export default mongoose.model("ApplyTask", applyTaskSchema);
