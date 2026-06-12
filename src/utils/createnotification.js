const express=require('express')
const Notification=require('../models/Notification')

/**
 * Creates a notification document for an ally or host profile.
 *
 * Errors are logged instead of thrown so notification failures do not block the main user action.
 *
 * @async
 * @param {Object} payload - Notification data.
 * @param {import('mongoose').Types.ObjectId|string} payload.userId - Recipient profile id.
 * @param {"AllyProfile"|"HostProfile"} payload.userModel - Recipient profile model name.
 * @param {string} payload.type - Notification event type.
 * @param {string} payload.title - Short notification title.
 * @param {string} payload.message - Notification message shown to the user.
 * @param {string} [payload.link] - Optional frontend route related to the notification.
 * @param {Object} [payload.meta] - Optional extra metadata such as task, host, ally, or application ids.
 * @returns {Promise<void>}
 */
const createNotification=async({userId,userModel,type,title,message,link,meta})=>{
    try{
        await Notification.create({
            userId,
            userModel,
            type,
            title,
            message,
            link,
            meta
        })
    }catch(err){
        console.log(err)
        console.log(err.message)
    }
}

module.exports=createNotification;
