const express=require('express');
const userRouter=express.Router();
const {register,login,logout,authMe,autoSignup,updateProfile}=require('../controllers/user.auth.controller');
const checkAuth=require('../middlewares/auth.middleware');
const {authRateLimiter}=require('../middlewares/rateLimiter')
userRouter.post('/register',authRateLimiter,register);
userRouter.post('/login',authRateLimiter,login)
userRouter.post('/logout',logout)
userRouter.post('/auto/signin',authRateLimiter,autoSignup); //for popup signin on frontend
userRouter.get('/auth/me',checkAuth,authMe);
userRouter.patch('/update/user',authRateLimiter,checkAuth,updateProfile);

module.exports=userRouter;