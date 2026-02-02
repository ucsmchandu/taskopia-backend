const PostTaskModel = require('../models/HostModels/PostTaskModel')

const autoCompleteTasks = async () => {
    try {
        const now = new Date();

        const tasks = await PostTaskModel.find({
            status: "completion_requested",
            endingDate: { $lte: now },
            isDeleted: false
        })

        for (const task of tasks) {
            task.status = "completed",
                task.completedAt = new Date();

            await task.save();
        }
    } catch (err) {
        console.log(err)
        console.log(err.message)
        return res.status(500).json({
            message: "Internal server error.",
            error: err
        })
    }
}

module.exports = autoCompleteTasks;