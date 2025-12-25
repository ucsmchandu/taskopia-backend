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
const { application } = require('express')
const { getApp } = require('firebase-admin/app')

// for ally
const applyTask = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const { coverMessage } = req.body;

        const allyProfile = await AllyProfileModel.findOne({ firebaseUid: uid });
        if (!allyProfile)
            return res.status(404).json({ message: "User not Found" });

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
        });

        await newApplication.save();

        // this is not atomic
        // getTask.applicationsCount+=1;
        // await getTask.save();

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

        const appliedTasks = await ApplyTaskModel.find({ applicant: getProfile._id })
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

// to update the status of the application
const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { uid } = req.firebaseUser
        const { status } = req.body;
        
        // return if the body is not valid
        if (!["accepted", "rejected"].includes(status))
            return res.status(400).json({ message: "Invalid status value" })
        // here has to update the two models
        // postTaskModel
        // ApplyTaskModel

        // get the host profile
        const getHostProfile = await HostProfileModel.findOne({ firebaseUid: uid })
        if (!getHostProfile)
            return res.status(404).json({ message: "Host profile not Found" })

        // get the application
        const getApplication = await ApplyTaskModel.findById(applicationId);
        if (!getApplication)
            return res.status(404).json({ message: "Application not Found" })

        // checking the host if he is not in application then he is not in task model
        if (getApplication.host.toString() !== getHostProfile._id.toString())
            return res.status(403).json({ message: "Not Authorized" })

        // updating the application if it is in applied
        if (getApplication.status !== "applied")
            return res.status(400).json({ message: "You can only update the applied applications" })

        // get the tasj details
        const getTask = await PostTaskModel.findById(getApplication.task)
        if (!getTask)
            return res.status(404).json({ message: "Task not Found" })

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
                { $set: { status: "rejected" } }
            );
            await getTask.save();
        }

        if (status === "rejected") {
            getApplication.status = "rejected"
        }

        await getApplication.save();

        return res.status(200).json({
            message: "Application Updated",
            application: getApplication
        })
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}





module.exports = { applyTask, getApplication, getMyApplications, getSingleApplication,updateApplicationStatus }