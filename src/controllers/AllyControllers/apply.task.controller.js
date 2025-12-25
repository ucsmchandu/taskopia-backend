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
const { application } = require('express')
const applyTask = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;
        const {coverMessage}=req.body;
        const allyProfile = await AllyProfileModel.findOne({ firebaseUid: uid });
        if (!allyProfile)
            return res.status(404).json({ message: "User not Found" });

        const taskId = req.params.taskId;
        const getTask = await PostTaskModel.findById(taskId);
        if (!getTask)
            return res.status(404).json({ message: "Task not Found" })

        const newApplication=new ApplyTaskModel({
            task:taskId,
            applicant:allyProfile._id,
            host:getTask.createdBy,
            coverMessage:coverMessage,
        });

        await newApplication.save();

        return res.status(200).json({
            message:"Your Application is Created successfully",
            applicationDetails:newApplication
        });

    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { applyTask }