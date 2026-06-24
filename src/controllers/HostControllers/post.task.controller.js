const {redisClient}=require('../../config/redis');
const PostTaskModel = require('../../models/HostModels/PostTaskModel');
const HostProfileModel = require('../../models/HostModels/HostProfileModel')
const ApplyTaskModel = require('../../models/AllyModels/ApplyTaskModel');
const createNotification = require('../../utils/createnotification');

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
 * Creates a new task for the authenticated host profile.
 *
 * @async
 * @param {import('express').Request} req - Authenticated request containing task fields, location coordinates, and an optional attachment file.
 * @param {import('express').Response} res - Express response used to return the created task id.
 * @returns {Promise<void>}
 */
const uploadTask = async (req, res) => {
    const { uid, userId } = req.firebaseUser;
    const findHostProfile = await HostProfileModel.findOne({ firebaseUid: uid });
    if (!findHostProfile)
        return res.status(404).json({ message: "Host profile is not found" });
    try {
        const {
            email,
            title,
            taskDescription,
            taskCategory,
            address,
            amount,
            urgencyLevel,
            startingDate,
            endingDate,
            workingHours,
            postRemovingDate,
            // attachments  //url,
            lng,
            lat
        } = req.body;
        // console.log(attachments);
        // console.log("img url :",req.file.path);

        // check if the location coordinates are recived or not
        if (!lat || !lng)
            return res.status(400).json({ message: "Location is Required" });

        const geoLocation = lat !== undefined && lng !== undefined && lat !== null && lng !== null ? {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
        } : null

        const newTask = new PostTaskModel({
            firebaseId: uid,
            taskTitle: title,
            description: taskDescription,
            taskCategory: taskCategory,
            budget: Number(amount),
            address,
            location: geoLocation,
            email: email,
            urgency: urgencyLevel,
            startingDate: startingDate,
            endingDate: endingDate,
            workingHours: workingHours,
            postRemovingDate: postRemovingDate,
            attachments: req.file?.path || null, // if the file is there attach it otherwise make it null (this data can be send by form data)
            createdBy: findHostProfile._id
        });
        await newTask.save();

        // invalidate the caches
        await invalidateTaskCaches(newTask._id);

        // send the notification for the host
        await createNotification({
            userId: findHostProfile._id,
            userModel: "HostProfile",
            type: "HOST_TASK_POSTED",
            title: "Task Posted Successfully.",
            message: "Your task has been posted and is now visible to allies.",
            link: "/host/dashboard", 
            meta: {
                taskId: newTask._id
            }
        })

        return res.status(200).json({
            message: "Task Uploaded successful",
            taskId: newTask._id,
            uploadTask: "true"
        });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({
            message: "Uploading task is incomplete",
            uploadTask: "false"
        })
    }
}

// to get all tasks including the assigned and completed tasks
/**
 * Gets all tasks regardless of status.
 *
 * @async
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response used to return all task documents.
 * @returns {Promise<void>}
 */
const getAllTasks = async (req, res) => {
    try {
        // get the data from the cache and return the data if there is data in cache
        try {
            const cachedTasks = await redisClient.get(tasksCacheKey);
            if (cachedTasks) {
                return res.status(200).json({
                    tasks: JSON.parse(cachedTasks)
                })
            }
        } catch (err) {
            console.error("redis cache read failed:", err);
        }

        // console.log("cache missed");
        const getTasks = await PostTaskModel.find().sort({createdAt: -1});
        
        if (!getTasks.length)
            return res.status(404).json({ message: "Tasks not found" });

        // if there is no data in cache then storing in cache
        try {
            await redisClient.set(tasksCacheKey, JSON.stringify(getTasks), {
                EX: 300
            })
        } catch (err) {
            console.error("redis cache write failed:", err);
        }

        return res.status(200).json({
            tasks: getTasks
        });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// to get the only active tasks
/**
 * Gets active posted tasks with optional search, urgency, pay, and distance filters.
 *
 * @async
 * @param {import('express').Request} req - Authenticated request with optional sort, search, lat, lng, and distance query params.
 * @param {import('express').Response} res - Express response used to return matching active tasks.
 * @returns {Promise<void>}
 */
const getActiveTasks = async (req, res) => {
    try {
        const { sort, lat, lng, distance, search } = req.query;

        const filter = {
            status: "posted",
            isActive: true,
            assignedAlly: null
        };

        if (search) {
            filter.$or = [
                { taskTitle: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (sort === "urgent") {
            filter.urgency = "urgent";
        }

        let query;

        if (lat !== undefined && lng !== undefined) {
            query = PostTaskModel.find({
                ...filter,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: (Number(distance) || 5) * 1000
                    }
                }
            });
        } else {
            query = PostTaskModel.find(filter);
            if (sort === "highestPaying") {
                query = query.sort({ budget: -1 });
            } else {
                query = query.sort({ createdAt: -1 });
            }
        }

        const tasks = await query;

        if (!tasks.length) {
            return res.status(404).json({ message: "Tasks Not Found" });
        }

        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// for host
/**
 * Gets all tasks created by the authenticated host.
 *
 * @async
 * @param {import('express').Request} req - Authenticated host request with firebaseUser populated by middleware.
 * @param {import('express').Response} res - Express response used to return the host's tasks.
 * @returns {Promise<void>}
 */
const getHostTasks = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const getHost = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!getHost)
            return res.status(404).json({ message: "Host not found" })

        const getTasks = await PostTaskModel.find({ createdBy: getHost._id });
        if (getTasks.length === 0)
            return res.status(404).json({ message: "No Tasks Found" });

        return res.status(200).json({
            message: "Tasks found",
            tasks: getTasks
        });
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

/**
 * Gets a task by id and includes limited host profile data.
 *
 * @async
 * @param {import('express').Request} req - Express request containing task id in route params.
 * @param {import('express').Response} res - Express response used to return the task document.
 * @returns {Promise<void>}
 */
const getTask = async (req, res) => {
    try {
        const id = req.params.id;

        // get the data from the cache
        try {
            const cacheTask = await redisClient.get(getTaskCacheKey(id))
            if (cacheTask) {
                return res.status(200).json({
                    task: JSON.parse(cacheTask)
                })
            }
        } catch (err) {
            console.error("redis cache read failed:", err);
        }

        const task = await PostTaskModel.findById(id).populate("createdBy", "firstName lastName rating");
        if (!task)
            return res.status(404).json({ message: "Task not found" });

        // store in cache
        try {
            await redisClient.set(getTaskCacheKey(id), JSON.stringify(task), {
                EX: 600
            });
        } catch (err) {
            console.error("redis cache write failed:", err);
        }

        return res.status(200).json({
            task: task
        });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// for host
/**
 * Soft deletes a posted task owned by the authenticated host and notifies applicants.
 *
 * @async
 * @param {import('express').Request} req - Authenticated host request containing taskId in route params.
 * @param {import('express').Response} res - Express response used to return the deleted task state.
 * @returns {Promise<void>}
 */
const deleteTask = async (req, res) => {
    try {
        const id = req.params.taskId;
        const { uid } = req.firebaseUser;
        const task = await PostTaskModel.findById(id);
        if (!task)
            return res.status(404).json({ message: "Task not found" });

        if (task.isDeleted)
            return res.status(400).json({ message: "Task already deleted" })

        if (task.status !== "posted")
            return res.status(400).json({ message: "Only posted tasks can be deleted" })

        const host = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!host)
            return res.status(404).json({ message: "Host Not Found" })

        if (task.createdBy.toString() !== host._id.toString())
            return res.status(403).json({ message: "Not Authorized" })

        task.isDeleted = true;
        await task.save();

        // invalidate the caches
        await invalidateTaskCaches(id);

        // Get all applicants for this task to notify them
        const applicants = await ApplyTaskModel.find({ task: id });

        // send notification for host
        await createNotification({
            userId: host._id,
            userModel: "HostProfile",
            type: "HOST_TASK_DELETED",
            title: "Task Deleted.",
            message: "Your task has been deleted successfully.",
            link: "/host/dashboard", 
            meta: {
                taskId: task._id
            }
        })

        // Send notifications to all applicants
        for (const application of applicants) {
            await createNotification({
                userId: application.applicant,
                userModel: "AllyProfile",
                type: "ALLY_TASK_DELETED",
                title: "Task Deleted.",
                message: "A task you applied for has been deleted by the host.",
                link: "/applied-tasks",
                meta: {
                    taskId: task._id,
                    hostId: host._id,
                    applicationId: application._id
                }
            });
        }

        return res.status(200).json({
            message: "Task Deleted",
            task
        });
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// for host
/**
 * Updates an authenticated host's task fields and optional attachment, then notifies applicants.
 *
 * @async
 * @param {import('express').Request} req - Authenticated host request containing task id in route params, editable fields, and optional attachment.
 * @param {import('express').Response} res - Express response used to return the updated task.
 * @returns {Promise<void>}
 */
const editTask = async (req, res) => {
    try {
        const uid = req.firebaseUser.uid;
        // const userId = req.firebaseUser.userId;
        const taskId = req.params.id;
        // console.log(req.file);
        if (!taskId)
            return res.status(404).json({ message: "Task not Found" });

        const task = await PostTaskModel.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Task not found" });

        const user = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!user)
            return res.status(404).json({ message: "Host Not Found" })


        if (task.createdBy.toString() !== user._id.toString())
            return res.status(403).json({ message: "Not authorized" })

        const updates = {};

        const fields = ["taskTitle", "description", "budget", "address", "email", "urgency", "startingDate", "endingDate", "workingHours", "postRemovingDate"];

        fields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; })

        if (req.file?.path.length) updates.attachments = req.file?.path;

        const editedTask = await PostTaskModel.findByIdAndUpdate(
            taskId,
            { $set: updates },
            { new: true }
        )

        // invalidate the caches
        await invalidateTaskCaches(taskId);

        // Get all applicants for this task to notify them
        const applicants = await ApplyTaskModel.find({ task: taskId });

        // send notification for host
        await createNotification({
            userId: user._id,
            userModel: "HostProfile",
            type: "HOST_TASK_UPDATED",
            title: "Task Updated.",
            message: "Your task details have been updated successfully.",
            link: `/task/details/${editedTask._id}`, // add view task details link here with task id
            meta: {
                taskId: editedTask._id
            }
        })

        // Send notifications to all applicants
        for (const application of applicants) {
            await createNotification({
                userId: application.applicant,
                userModel: "AllyProfile",
                type: "ALLY_TASK_UPDATED", // Using ALLY_TASK_APPLIED to indicate task was updated
                title: "Task Updated.",
                message: "A task you applied for has been updated by the host.",
                link: `/view/applied/task/details/${editedTask._id}`, 
                meta: {
                    taskId: editedTask._id,
                    hostId: user._id,
                    applicationId: application._id
                }
            });
        }


        res.status(200).json({
            message: "Task Updated Successfully",
            updatedTask: editedTask
        })
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}



module.exports = { uploadTask, getAllTasks, getActiveTasks, deleteTask, getTask, editTask, getHostTasks };
