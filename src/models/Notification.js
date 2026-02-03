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
            // BOTH
            "TASK_COMPLETED",

            // ALLY
            "ALLY_TASK_APPLIED",
            "ALLY_TASK_CANCELLED",
            "ALLY_TASK_DELETED",
            "ALLY_APPLICATION_REJECTED",
            "ALLY_TASK_COMPLETED",
            "ALLY_PROFILE_UPDATED",
            "ALLY_APPLICATION_ACCEPTED",
            "ALLY_TASK_UPDATED",
            "ALLY_PROFILE_CREATED",
            "ALLY_REQUESTED_COMPLETION",



            // HOST
            "HOST_TASK_POSTED",
            "HOST_NEW_APPLICANT",
            "HOST_TASK_UPDATED",
            "HOST_PROFILE_UPDATED",
            "HOST_PROFILE_CREATED",
            "HOST_TASK_DELETED",
            "HOST_TASK_COMPLETED",
            "HOST_APPLICATION_ACCEPTED",
            "HOST_APPLICATION_CANCELLED",
            "HOST_ACCEPT_TASK_COMPLETION"

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
    },
    meta: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;