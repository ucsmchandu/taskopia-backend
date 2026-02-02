const PostTaskModel = require('../models/HostModels/PostTaskModel')
const ApplyTaskModel = require('../models/AllyModels/ApplyTaskModel')

const autoCompleteTasks = async () => {
    try {
        const now = new Date();

        // get the tasks
        const tasks = await PostTaskModel.find({
            status: "completion_requested",
            endingDate: { $lte: now },
            isDeleted: false
        })

        for (const task of tasks) {
            task.status = "completed",
            task.completedAt = new Date();
            await task.save();

            // only update the task which are accepted
            await ApplyTaskModel.findOneAndUpdate({
                task: task._id,
                status: "accepted",
            }, {
                $set: {
                    status: "completed",
                    completedAt: new Date(),
                }
            })
        }
    } catch (err) {
        console.log(err)
        console.log(err.message)
    }
}

module.exports = autoCompleteTasks;