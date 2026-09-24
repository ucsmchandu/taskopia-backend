const express=require('express')
const rateRouter=express.Router()
const checkAuth=require('../middlewares/auth.middleware')
const {createRating,getReviews}=require('../controllers/rating.controller')


rateRouter.post("/tasks/:taskId",checkAuth,createRating);
rateRouter.get("/profile/reviews/:profileId",getReviews);

module.exports=rateRouter;