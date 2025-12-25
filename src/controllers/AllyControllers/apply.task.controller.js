// Method	Endpoint	What it does
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
        if(err.code===11000)
            return res.status(409).json({message:"You already applied to this task"})
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

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



module.exports = { applyTask, getApplication }