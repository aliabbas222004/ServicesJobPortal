require('dotenv').config();

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser');
const { checkForAuthenticationCookie,checkForCompanyAuthenticationCookie } = require('./middlewares/authentication');
const app=express();
const PORT=process.env.PORT || 8000;
const userRoute=require('./routes/user');
const companyRoute=require('./routes/company');

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));


app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(checkForCompanyAuthenticationCookie('companytoken'));
app.use(checkForAuthenticationCookie('usertoken'));
app.use(express.json());

app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL).then((e)=>{
    console.log("Monogodb connected");
});

app.get('/',async (req,res)=>{
    return res.render("home",{
        user:req.user,
        company:req.company,
    });
})


app.use('/user',userRoute);
app.use('/company',companyRoute);

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
})
