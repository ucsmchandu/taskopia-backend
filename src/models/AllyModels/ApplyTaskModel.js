const mongoose=require('mongoose')

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
      unique:true
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

applyTaskSchema.index({ task: 1}, { unique: true });

const ApplyTaskModel = mongoose.model("AppliedTask", applyTaskSchema);

module.exports = ApplyTaskModel;