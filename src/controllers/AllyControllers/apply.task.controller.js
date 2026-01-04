// POST	/tasks/:taskId/apply	Ally applies
// GET	/tasks/:taskId/applicants	Host sees all applicants
// GET	/applications/me	Ally sees their applications
// GET	/applications/:id	Get one application
// PATCH	/applications/:id/status	Host accepts / rejects
// PATCH	/applications/:id/cancel	Ally cancels application
// GET	/tasks/:taskId/my-application	Check if ally already applied
// GET	/tasks/:taskId/applicants/count	Count applicants
// PATCH	/tasks/:taskId/complete	Mark task completed (not application)

const PostTaskModel = require('../../models/HostModels/PostTaskModel')
const ApplyTaskModel = require("../../models/AllyModels/ApplyTaskModel")
const AllyProfileModel = require("../../models/AllyModels/AllyProfileModel")
const HostProfileModel = require("../../models/HostModels/HostProfileModel")
const User=require("../../models/User")
const mongoose = require('mongoose')
const { application } = require('express')
// for ally
const applyTask = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const { coverMessage } = req.body;

        const allyProfile = await AllyProfileModel.findOne({ firebaseUid: uid });
        if (!allyProfile)
            return res.status(404).json({ message: "User not Found" });

        const user=await User.findOne({userFirebaseId:uid})
        if(!user)
            return res.status(404).json({message:"User not found"});

        const taskId = req.params.taskId;
        const getTask = await PostTaskModel.findById(taskId);
        if (!getTask)
            return res.status(404).json({ message: "Task not Found" })

        if (getTask.createdBy.toString() === allyProfile._id.toString())
            return res.status(400).json({ message: "You cannot apply to your own task" });

        if (["assigned", "completed", "cancelled"].includes(getTask.status))
            return res.status(400).json({ message: "Task is not open for applications" });

        const newApplication = new ApplyTaskModel({
            task: taskId,
            applicant: allyProfile._id,
            host: getTask.createdBy,
            coverMessage: coverMessage,
            status: "applied",
            statusHistory: [
                {
                    status: "applied",
                    changedBy: user._id
                }
            ]
        });

        await newApplication.save();

        // this is atomic
        await PostTaskModel.findByIdAndUpdate(
            taskId,
            { $inc: { applicationsCount: 1 } }
        );

        return res.status(200).json({
            message: "Your Application is Created successfully",
            applicationDetails: newApplication
        });

    } catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: "You already applied to this task" })
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// this is for host to see the applications for the task
const getApplication = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { uid } = req.firebaseUser;

        const getTask = await PostTaskModel.findById(taskId);
        if (!getTask)
            return res.status(404).json({ message: "Task not Found" })

        const getHost = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!getHost)
            return res.status(404).json({ message: "Host not Found" });

        if (getTask.createdBy.toString() !== getHost._id.toString())
            return res.status(403).json({ message: "Not Authorized" });

        const applications = await ApplyTaskModel.find({ task: taskId }).populate("applicant", "firstName lastName rating");

        if (applications.length === 0)
            return res.status(404).json({ message: "No Applications are Found on This Task" })

        return res.status(200).json({
            message: "Applications Found",
            applications: applications
        })

    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// this is for ally to see their applied task
const getMyApplications = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;

        const getProfile = await AllyProfileModel.findOne({ firebaseUid: uid })
        if (!getProfile)
            return res.status(404).json({ message: "Ally not found" })

        const appliedTasks = await ApplyTaskModel.find({ applicant: getProfile._id }).populate("task"," taskTitle budget taskCategory ").populate("host","firstName lastName addressDetails")
        if (appliedTasks.length === 0)
            return res.status(404).json({ message: "No applied tasks were found" })

        return res.status(200).json({
            message: "Applied tasks found",
            tasks: appliedTasks
        });
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// this for ally to get one application
const getSingleApplication = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const { uid } = req.firebaseUser

        const getAppliedTask = await ApplyTaskModel.findById(applicationId);
        if (!getAppliedTask)
            return res.status(404).json({ message: "Application not Found" })

        const allyProfile = await AllyProfileModel.findOne({ firebaseUid: uid })
        if (!allyProfile || getAppliedTask.applicant.toString() !== allyProfile._id.toString())
            return res.status(403).json({ message: "Not Authorized" })

        return res.status(200).json({
            message: "Task aFound",
            task: getAppliedTask
        })
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to update the status of the application (for host)
const updateApplicationStatus = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const applicationId = req.params.id;
        const { uid } = req.firebaseUser
        const { status } = req.body;

        // return if the body is not valid
        if (!["accepted", "rejected"].includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid status value" })
        }
        // here has to update the two models
        // postTaskModel
        // ApplyTaskModel

        // get the host profile
        const getHostProfile = await HostProfileModel.findOne({ firebaseUid: uid }).session(session)
        if (!getHostProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Host profile not Found" })
        }

        // get the application
        const getApplication = await ApplyTaskModel.findById(applicationId).session(session);
        if (!getApplication) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Application not Found" })
        }

        // checking the host if he is not in application then he is not in task model
        if (getApplication.host.toString() !== getHostProfile._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not Authorized" })
        }

        // updating the application if it is in applied
        if (getApplication.status !== "applied") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "You can only update the applied applications" })
        }

        // get the tasj details
        const getTask = await PostTaskModel.findById(getApplication.task).session(session)
        if (!getTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Task not Found" })
        }

        // action is not done if the task is assigned,compledted,cancelled
        if (["assigned", "completed", "cancelled"].includes(getTask.status))
            return res.status(400).json({ message: "Task is no longer accepting decisions" })

        // update the two models
        if (status === "accepted") {
            getApplication.status = "accepted";
            getTask.status = "assigned";
            getTask.assignedAlly = getApplication.applicant;

            // reject remaing all applications
            await ApplyTaskModel.updateMany(
                { task: getTask._id, _id: { $ne: getApplication._id } },
                { $set: { status: "rejected" } },
                { session }
            );
            await getTask.save({ session });
        }

        if (status === "rejected") {
            getApplication.status = "rejected"
        }

        await getApplication.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            message: "Application Updated",
            application: getApplication
        })
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to cancel the application (for ally)
const cancelApplication = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { uid } = req.firebaseUser;
        const applicationId = req.params.id;

        // get the ally profile
        const getAllyProfile = await AllyProfileModel.findOne({ firebaseUid: uid }).session(session)
        if (!getAllyProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Ally profile not found" })
        }

        // get the applied task
        const getAppliedTask = await ApplyTaskModel.findById(applicationId).session(session)
        if (!getAppliedTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Applied task not found" })
        }

        // check if the user is correct or not
        if (getAppliedTask.applicant.toString() !== getAllyProfile._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not Authorized" });
        }

        // get the applied task
        const getTask = await PostTaskModel.findById(getAppliedTask.task).session(session)
        if (!getTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Task not found" })
        }

        // checking diff conditions in application
        if (["cancelled", "rejected", "completed"].includes(getAppliedTask.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Application not cancellable" });
        }

        // checking the diff condition in task
        if (["completed", "cancelled"].includes(getTask.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Task is closed" });
        }

        const originalStatus = getAppliedTask.status;
        // if already accepted
        if (getAppliedTask.status === "accepted") {
            getAppliedTask.status = "cancelled";
            getTask.status = "posted";
            getTask.assignedAlly = null
        } else if (getAppliedTask.status === "applied") {
            getAppliedTask.status = "cancelled"
        }


        const shouldDecrement = originalStatus === "applied" || originalStatus === "accepted"

        // decrease the count
        if (shouldDecrement) {
            await PostTaskModel.findOneAndUpdate(
                { _id: getTask._id, applicationsCount: { $gt: 0 } },
                { $inc: { applicationsCount: -1 } },
                { session }
            );
        }

        await getAppliedTask.save({ session });
        await getTask.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Application cancelled",
            application: getAppliedTask
        })
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// for checking that ally applied for the task or not. this also return the applied tasks (for ally)
const checkAllyAppliedTask = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const taskId = req.params.taskId;

        const getAllyProfile = await AllyProfileModel.findOne({ firebaseUid: uid })
        if (!getAllyProfile)
            return res.status(404).json({ message: "Ally profile not found" });

        const getTask = await PostTaskModel.findById(taskId)
        if (!getTask)
            return res.status(404).json({ message: "Task not found" })

        const getAppliedTask = await ApplyTaskModel.findOne({ task: getTask._id, applicant: getAllyProfile._id });
        if (!getAppliedTask)
            return res.status(404).json({ message: "You are not applied to this task", applied: false, application: null })

        return res.status(200).json({
            message: "Application found",
            applied: true,
            application: getAppliedTask
        })
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Sever Error" })
    }
}

// to get the count of application for a particular task (for host)
const getApplicationsCount = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const taskId = req.params.taskId

        const getHostProfile = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!getHostProfile)
            return res.status(404).json({ message: "Host profile is not found" })

        const getTask = await PostTaskModel.findById(taskId)
        if (!getTask)
            return res.status(404).json({ message: "Task not found" })

        if (getHostProfile._id.toString() !== getTask.createdBy.toString())
            return res.status(403).json({ message: "Not Authorized" })

        const applicationsCount = Math.max(0, getTask.applicationsCount || 0);

        return res.status(200).json({
            message: "Task found",
            count: applicationsCount
        })

    } catch (error) {
        console.log(error)
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to mark the task completed (for host)
const markTaskCompleted = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { uid } = req.firebaseUser
        const taskId = req.params.taskId

        // get the task
        const getTask = await PostTaskModel.findById(taskId).session(session)
        if (!getTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Task not found" })
        }

        // get the host
        const getUser = await HostProfileModel.findOne({ firebaseUid: uid }).session(session)
        if (!getUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Host not found" })
        }

        // check the auth
        if (getTask.createdBy.toString() !== getUser._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not Authorized" })
        }

        // get the application
        const getApplication = await ApplyTaskModel.findOne({ task: taskId }).session(session)
        if (!getApplication) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Application not found" })
        }

        if (["completed", "cancelled"].includes(getTask.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Task is already ${getTask.status}` })
        }

        if (["rejected", "cancelled", "completed"].includes(getApplication.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Application already ${getApplication.status}` });
        }

        if (!(getApplication.status === "accepted" && getTask.status === "assigned")) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Task cannot be completed yet. it must be assigned and the application must be accepted" })
        }

        getApplication.status = "completed"
        getTask.status = "completed"

        await getApplication.save({ session });
        await getTask.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Task marked as completed",
            task: getTask,
            application: getApplication
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to cancel the task (for host)
const cancelTask = async (req, res) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction();
        const { uid } = req.firebaseUser
        const taskId = req.params.taskId

        // get the task
        const getTask = await PostTaskModel.findById(taskId).session(session)
        if (!getTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Task not found" })
        }

        // get the host
        const getHost = await HostProfileModel.findOne({ firebaseUid: uid }).session(session)
        if (!getHost) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Host profile not found" })
        }

        // check the auth
        if (getHost._id.toString() !== getTask.createdBy.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not Authorized" })
        }

        if (["completed", "cancelled"].includes(getTask.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Task is already ${getTask.status}` })
        }

        // update the applications which not completed and cancelled 
        await ApplyTaskModel.updateMany(
            { task: taskId, status: { $nin: ["completed", "cancelled"] } },
            { $set: { status: "cancelled" } },
            { session }
        )

        getTask.status = "cancelled"
        getTask.assignedAlly = null

        await getTask.save({ session })

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            message: "Task is Cancelled",
            task: getTask
        })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}




module.exports = {
    applyTask,
    getApplication,
    getMyApplications,
    getSingleApplication,
    updateApplicationStatus,
    cancelApplication,
    checkAllyAppliedTask,
    getApplicationsCount,
    markTaskCompleted,
    cancelTask
}