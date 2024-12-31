const {Router}=require('express');
const router=Router();
const User=require('../models/user');
const Company=require('../models/company');
const multer=require('multer');
const fs=require('fs');
const path=require('path');
const { createTokenForUser,createTokenForCompany } = require('../services/authentication');
const CompanyServices=require('../models/companyServices');
const ActiveRequests=require('../models/activerequests');
const hiringCompany=require('../models/hiringCompany');

const storage=multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.resolve(`./public/uploads/`));
    },
    filename:function (req,file,cb){
        const filename=`${Date.now()}-${file.originalname}`;
        cb(null,filename);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/pjpeg') {
        return cb(("Please upload a valid JPEG file"), false);
    }
    cb(null, true);
};

const upload=multer({storage:storage,fileFilter:fileFilter});

router.get('/signin',(req,res)=>{
    return res.render("signin");
})

router.get('/signinAsUser',(req,res)=>{
    return res.render("signinasuser");
})

router.get('/signinAsCompany',(req,res)=>{
    return res.render("signinascom");
})

router.get('/signup',(req,res)=>{
    return res.render("signup");
});

router.get('/signupAsCompany',(req,res)=>{
    return res.render("signupascom");
});

router.get('/signupAsUser',(req,res)=>{
    return res.render("signupasuser");
});


router.get('/aboutus',(req,res)=>{
    if(req.user){
        return res.render("aboutus",{
            user:req.user
        });
    }
    else if(req.company){
        return res.render("aboutus",{
            company:req.company
        });
    }
    return res.render("aboutus");
});


router.post('/signinAsUser',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const usertoken=await User.matchPasswordAndGenerateToken(email,password);
        return res.cookie('usertoken',usertoken).redirect("/");
    }
    catch(error){
        return res.render('signin',{
            error:error,
            email
        });
    }
})



router.post('/signinAsCompany',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const { token: companytoken, services,company,hiringServices:hiringservices,activerequests,activeservices } = await Company.matchPasswordAndGenerateToken(email, password);
        
        // const companytoken=await Company.matchPasswordAndGenerateToken(email,password);
        
        // return res.cookie('companytoken',companytoken).redirect("/");
        const hiringservicesArray = Array.isArray(hiringservices) ? hiringservices : [hiringservices];
        const sArray=Array.isArray(services)?services:[services];
        
        res.cookie('companytoken', companytoken); 
        return res.render('home',{
            company,
            services:sArray,
            hiringservices:hiringservicesArray,
            activerequests,
            activeservices,
            email,
        });
    }
    catch(error){
        return res.render('signin',{
            error:error,
            email
        });
    }
})

router.post('/signupAsCompany',upload.single('profileImage'),async (req,res)=>{
    const {fullName,email,password,city,companyType}=req.body;
    console.log(req.body);
    const company=await Company.create({
        fullName,
        email,
        password,
        profileImage:`/uploads/${req.file.filename}`,
        city,
        companyType
    });
    const companytoken=createTokenForCompany(company);
    return res.cookie('companytoken',companytoken).redirect("/");
});

router.post('/signupAsUser',upload.single('profileImage'),async (req,res)=>{
    console.log("Hello");
    const {fullName,email,password,city}=req.body;
    console.log(req.body);
    const user=await User.create({
        fullName,
        email,
        password,
        profileImage:`/uploads/${req.file.filename}`,
        city
    });
    const usertoken=createTokenForUser(user);
    return res.cookie('usertoken',usertoken).redirect("/");
});

router.get('/logout',(req,res)=>{
    res.clearCookie('companytoken');
    res.clearCookie('usertoken').redirect("/");
});


router.get('/searchjob',async (req,res)=>{
    const hiringcompanies=await hiringCompany.find();

    const companyInfo = await Company.find();
    const matchedData = hiringcompanies.map(service => {
        const company = companyInfo.find(comp => comp._id.toString() === service.companyId.toString());
        if (company) {
            return {
                service,
                company,
            };
        }
        return null;
    }).filter(item => item !== null);

    res.render('showandsearchjob', {
        matchedData,
        user: req.user,
    });

    // res.render('showandsearchjob');
});

router.get('/searchservice',async (req,res)=>{
    const serviceCompanies = await CompanyServices.find();
    const companyInfo = await Company.find();
    const matchedData = serviceCompanies.map(service => {
        const company = companyInfo.find(comp => comp._id.toString() === service.companyId.toString());
        if (company) {
            return {
                service,
                company,
            };
        }
        return null;
    }).filter(item => item !== null);

    res.render('showandsearchservice', {
        matchedData,
        user: req.user,
    });
    // const servicecomapnies=await Company.find();
    // res.render('showandsearchservice',
    //     {
    //         servicecomapnies,
    //         user:req.user
    //     }
    // );
});


router.get('/:id', async (req, res) => {
    const company = await Company.findById(req.params.id);
    const serviceType = req.query.serviceType;
    
        const services = await hiringCompany.find({
            companyId: req.params.id,
            serviceType: serviceType

        });
        
        const mergedData = {
            company,
            services,
        };

        console.log(mergedData.services);

        return res.render("jobInfo", {
            user: req.user,
            mergedData,
            serviceType
        });
});

router.post('/showquiz',async (req,res)=>{
    const fileName = `${req.body.companyId}_${req.body.serviceType}.txt`;
    const filePath = path.join(__dirname, 'data', fileName);
    let questions;
    fs.readFile(filePath,"utf-8",function(err,data){
        questions=JSON.parse(data);
        const companyId=req.body.companyId;
        const serviceType=req.body.serviceType;
        return res.render("jobquiz", {
            user: req.user,
            questions,
            companyId,
            serviceType
        });
    });
    
});


router.post('/validatequiz', async (req, res) => {
    console.log(req.body);
    const userAnswers = req.body.answers; 
    const fileName = `${req.body.companyId}_${req.body.serviceType}.txt`;
    const filePath = path.join(__dirname, 'data', fileName);

    fs.readFile(filePath, "utf-8", async(err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Error validating quiz.");
        }

        let questions;
        try {
            questions = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr);
            return res.status(500).send("Invalid quiz data.");
        }

        const results = questions.map((question, index) => ({
            question: question.question,
            isCorrect: userAnswers[index] == question.correctOption
        }));

        const correctAnswersCount = results.filter(result => result.isCorrect).length;
        // const quizResult = new ActiveRequests({
        //     userId: req.user._id,
        //     companyId: req.body.companyId,
        //     serviceType: req.body.serviceType,
        //     correctAnswers: correctAnswersCount,
        // });

        const quizResult=await ActiveRequests.create({
            userId: req.user._id,
            companyId: req.body.companyId,
            serviceType: req.body.serviceType,
            marks: correctAnswersCount,
        });



        res.render("quizresults", {
            user: req.user,
            results
        });
    });
});



module.exports=router;