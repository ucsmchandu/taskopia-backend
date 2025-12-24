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
        type: String,
        required: true
    },
    endingDate: {
        type: String,
        required: true
    },
    workingHours: {
        type: String,
        required: true
    },
    postRemovingDate: {
        type: String,
        required: true
    },
    attachments: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["posted", "assigned", "in-progress", "completed", "cancelled"],
        default: "posted"
    },
    assignedAlly: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const PostTaskModel = mongoose.model('ActiveTask', PostTaskSchema);
module.exports = PostTaskModel;