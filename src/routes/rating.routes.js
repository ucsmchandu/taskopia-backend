const express=require('express')
const rateRouter=express.Router()
const checkAuth=require('../middlewares/auth.middleware')
const createRating=require('../controllers/rating.controller')


rateRouter.post("/tasks/:taskId",checkAuth,createRating);

module.exports=rateRouter;