const mongoose = require('mongoose')

const applyTaskSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveTask",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllyProfile",   // Ally
      required: true,
      // unique:true
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostProfile",   // Host
      required: true,
    },

    coverMessage: {
      type: String,
      trim: true,
      maxLength: 500,
    },

    // expectedPay: {
    //   type: Number,
    //   min: 0,
    // },

    status: {
      type: String,
      enum: ["applied", "accepted", "rejected", "cancelled", "completed"],
      default: "applied",
    },

    selectedAt: Date,
    completedAt: Date,
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      }
    ],
    rejectionReason: String,
    cancellationReason: String,

    hostConfirmedCompleted:Boolean,
    allyConfirmedCompletion:Boolean,
  },
  { timestamps: true }
);

applyTaskSchema.index({ applicant: 1, task: 1 }, { unique: true });

const ApplyTaskModel = mongoose.model("AppliedTask", applyTaskSchema);

module.exports = ApplyTaskModel;