const PostTaskModel = require('../models/HostModels/PostTaskModel')

const autoExpiresTasks = async () => {
    try {
        const now = new Date();

        const tasks = await PostTaskModel.find({
            status: "posted",
            isDeleted: false,
            postRemovingDate: { $lte: now },
        })

        for (const task of tasks) {
            task.status = "expired",
                task.isDeleted = true,
                task.isActive = false,
                task.expiredAt = new Date();

            await task.save();
        }
    } catch (err) {
        console.log(err)
        console.log(err.message)
    }
}

module.exports = autoExpiresTasks;