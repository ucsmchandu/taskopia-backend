const express=require('express');
const userRouter=express.Router();
const {register,login,logout,authMe,autoSignup,updateProfile}=require('../controllers/user.auth.controller');
const checkAuth=require('../middlewares/auth.middleware');
userRouter.post('/register',register);
userRouter.post('/login',login)
userRouter.post('/logout',logout)
userRouter.post('/auto/signin',autoSignup); //for popup signin on frontend
userRouter.get('/auth/me',checkAuth,authMe);
userRouter.patch('/update/user',checkAuth,updateProfile);

module.exports=userRouter;