const Notification = require('../../models/Notification')
const AllyProfileModel = require('../../models/AllyModels/AllyProfileModel')
const HostProfileModel = require('../../models/HostModels/HostProfileModel')

// to get the notifiactions
const getNotifications = async (req, res) => {
    const { uid, userType } = req.firebaseUser;
    // console.log(uid)
    // console.log(userType)
    let user;

    try {
        if (userType === "ally") {
            user = await AllyProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Ally Not Found" });
        } else {
            user = await HostProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Host Not Found" });
        }
        const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(notifications);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to fetch notifications" })
    }
}

// to mark a single notification as read
const markAsRead = async (req, res) => {
    const { uid, userType } = req.firebaseUser;
    const notificationId = req.params.id;
    let user;
    try {
        if (userType === "ally") {
            user = await AllyProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Ally Not Found" });
        } else {
            user = await HostProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Host Not Found" });
        }
        const notification = await Notification.findOneAndUpdate({
            _id: notificationId,
            userId: user._id,
        },
            { isRead: true },
            { new: true }
        );

        if (!notification)
            return res.status(404).json({ message: "notification not found" });

        res.status(200).json(notification);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "failed to update notifications" })
    }
}

// to mark all notifications as read
const markAllAsRead = async (req, res) => {
    const { uid, userType } = req.firebaseUser;
    let user;
    try {
        if (userType === "ally") {
            user = await AllyProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Ally Not Found" });
        } else {
            user = await HostProfileModel.findOne({ firebaseUid: uid });
            if (!user)
                return res.status(404).json({ message: "Host Not Found" });
        }
        await Notification.updateMany(
            { userId: user._id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "failed to update notifications" });
    }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };