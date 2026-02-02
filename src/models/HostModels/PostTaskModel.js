const mongoose = require('mongoose');

const PostTaskSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true
    },
    taskTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: [200, 'Description cannot be exceed 200 characters'],
        trim: true
    },
    taskCategory: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        required: true
    },
    startingDate: {
        type: Date,
        required: true
    },
    endingDate: {
        type: Date,
        required: true
    },
    workingHours: {
        type: String,
        required: true
    },
    postRemovingDate: {
        type: Date,
        required: true
    },
    attachments: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HostProfile",
        required: true
    },
    status: {
        type: String,
        enum: ["posted", "assigned", "in-progress", "completed", "cancelled", "completion_requested", "disputed", "expired", "refunded"],
        default: "posted"
    },
    assignedAlly: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AllyProfile",
        default: null
    },
    applicationsCount: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        }
    },
    completionRequestedAt: {
        type: Date,
        default: null
    },
    completedAt:{
        type:Date,
        default:null
    },
    expiredAt: {
        type: Date,
        default: null
    },
    // endReason: {
    //     type: String,
    //     enum: [
    //         "auto_expired",
    //         "completed",
    //         "host_deleted",
    //         "ally_cancelled"
    //     ],
    //     default: null
    // }
}, { timestamps: true })

PostTaskSchema.index({ location: "2dsphere" });


const PostTaskModel = mongoose.model('ActiveTask', PostTaskSchema);
module.exports = PostTaskModel;

/*
acceptedAt: Date,

completionRequestedAt: Date,

expiredAt: Date,

escrowAmount: {
  type: Number,
  required: true
},

platformFee: {
  type: Number,
  required: true
},

razorpayPaymentId: String,
razorpayOrderId: String,

*/