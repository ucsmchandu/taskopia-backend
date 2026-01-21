const PostTaskModel = require('../../models/HostModels/PostTaskModel');
const HostProfileModel = require('../../models/HostModels/HostProfileModel')
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
const getAllTasks = async (req, res) => {
    try {
        const getTasks = await PostTaskModel.find({});
        if (!getTasks)
            return res.status(404).json({ message: "Tasks not found" });

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

const getTask = async (req, res) => {
    try {
        const id = req.params.id;
        const task = await PostTaskModel.findById(id).populate("createdBy", "firstName lastName rating");
        if (!task)
            return res.status(404).json({ message: "Task not found" });
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

const deleteTask = async (req, res) => {
    try {
        const id = req.params.taskId;
        const { uid } = req.firebaseUser;
        const task = await PostTaskModel.findById(id);
        if (!task)
            return res.status(404).json({ message: "Event not found" });

        const user = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!user)
            return res.status(404).json({ message: "Host Not Found" })

        if (task.createdBy.toString() !== user._id.toString())
            return res.status(403).json({ message: "Not Authorized" })
        const deletedTask = await PostTaskModel.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(400).json({ message: "Error occur while task is deleting" })
        }
        return res.status(200).json({
            message: "Task Deleted",
            deletedTask
        });
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

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