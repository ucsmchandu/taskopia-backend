const express=require('express')
const Notification=require('../models/Notification')

const createNotification=async({userId,type,title,message,link})=>{
    try{
        await Notification.create({
            userId,
            type,
            title,
            message,
            link
        })
    }catch(err){
        console.log(err)
        console.log(err.message)
        res.status(500).json({message:err.message})
    }
}

module.exports=createNotification;