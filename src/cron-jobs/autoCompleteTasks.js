const PostTaskModel = require('../models/HostModels/PostTaskModel')
const ApplyTaskModel = require('../models/AllyModels/ApplyTaskModel')
const { redisClient } = require('../config/redis')

const tasksCacheKey = "tasks:all";
const getTaskCacheKey = (taskId) => `task:${taskId}`;

const invalidateTaskCaches = async (taskId) => {
    const keys = [tasksCacheKey];

    if (taskId) {
        keys.push(getTaskCacheKey(taskId));
    }

    try {
        await redisClient.del(...keys);
    } catch (err) {
        console.error("redis cache invalidation failed:", err);
    }
};

/**
 * Automatically completes tasks whose completion was requested and whose ending date has passed.
 *
 * Also marks the accepted application for each matching task as completed.
 *
 * @async
 * @returns {Promise<void>}
 */
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
            await invalidateTaskCaches(task._id);

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
