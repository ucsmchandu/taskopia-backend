require('dotenv').config();
const express=require("express");
const cors=require('cors');
const connectDB=require('./db')
 const route=require('./routes/index'); // import from the routes folder

connectDB();
const app=express();
app.use(cors({
    origin:["http://localhost:5173",'https://taskopia-one.vercel.app'],
    methods:["GET","POST","PUT","DELETE","OPTIONS"],
    credentials:true
}))
app.use(express.json());
app.use('/taskopia/u1/api',route);
// app.get("/",(req,res)=>{
//     res.send("hello world");
// })



app.listen(process.env.PORT,()=>{
    console.log("server runs on 3000 port");
})