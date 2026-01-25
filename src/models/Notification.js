const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['HostProfile', 'AllyProfile']
    },
    type: {
        type: String,
        enum: [
            "TASK_APPLIED",
            "TASK_ACCEPTED",
            "TASK_REJECTED",
            "TASK_COMPLETED",
            "NEW_MESSAGE"
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;