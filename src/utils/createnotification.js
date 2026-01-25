const express=require('express')
const Notification=require('../models/Notification')

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