const PostTaskModel = require('../models/HostModels/PostTaskModel')
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
 * Automatically expires posted tasks after their configured removal date.
 *
 * Matching tasks are marked expired, inactive, deleted, and stamped with expiredAt.
 *
 * @async
 * @returns {Promise<void>}
 */
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
            await invalidateTaskCaches(task._id);
        }
    } catch (err) {
        console.log(err)
        console.log(err.message)
    }
}

module.exports = autoExpiresTasks;
