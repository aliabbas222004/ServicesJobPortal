const {Router}=require('express');
const router=Router();
const User=require('../models/user');
const Company=require('../models/company');
const BookedService=require('../models/bookedservice');
const companyServices=require('../models/companyServices');
const hiringCompany=require('../models/hiringCompany');
const fs = require('fs').promises;
const path = require('path');

router.get('/:id', async (req, res) => {
    // const company = await Company.findById(req.params.id);
    // return res.render("serviceInfo", {
    //     user:req.user,
    //     company
    // });
    const company = await Company.findById(req.params.id);
    const serviceType = req.query.serviceType;
    
        const services = await companyServices.find({
            companyId: req.params.id,
            serviceType: serviceType

        });
        
        const mergedData = {
            company,
            services,
        };

        console.log(mergedData.services);

        return res.render("serviceInfo", {
            user: req.user,
            mergedData,
            serviceType, // Pass the serviceType for context
        });
});

router.post('/bookService',async(req,res)=>{
    const userId=req.body.userId;
    const companyId=req.body.companyId;
    const date=req.body.date;
    const timeforservice=req.body.timeforservice;
    console.log(req.body);
    const existingBooking = await BookedService.findOne({
        userId,
        companyId,
        date,
    });

    if (existingBooking) {
        return res.render("servicebooked", {
            user: req.user,
            message: "Service is already booked for this date and time.",
        });
    }
    await BookedService.create({
        userId,
        companyId,
        date,
        timeforservice
    });
    return res.render("servicebooked",{
        user:req.user,
    });
});

router.post('/addService',async (req,res)=>{
    return res.render("addService",{
        company:req.company,
    });
});

router.post('/addCompanyforHiring',async (req,res)=>{
    return res.render("addCompanyHiring",{
        company:req.company,
    });
});

router.post('/addServiceforCompany',async(req,res)=>{
    const serviceType=req.body.service;
    const serviceCharge=req.body.serviceCharge;
    const companyId = req.company._id;

    try {
        const existingService = await companyServices.findOne({ companyId, serviceType });
        
        if (existingService) {
            return res.redirect("/");
        }

        await companyServices.create({
            companyId,
            serviceType,
            serviceCharge,
        });

        return res.redirect("/");
    } catch (error) {
        console.error("Error adding service:", error);
        return res.status(500).send("Internal Server Error");
    }
});


// router.post('/addHiringforCompanyService',async(req,res)=>{
//     // const serviceType=req.body.service;
//     // const salary=req.body.salary;
//     // const companyId = req.company._id;

//     // try {
//     //     const existingService = await hiringCompany.findOne({ companyId, serviceType });
        
//     //     if (existingService) {
//     //         return res.redirect("/");
//     //     }

//     //     await hiringCompany.create({
//     //         companyId,
//     //         serviceType,
//     //         salary,
//     //     });

//     //     return res.redirect("/");
//     // } catch (error) {
//     //     console.error("Error adding service:", error);
//     //     return res.status(500).send("Internal Server Error");
//     // }


    
// });


router.post('/addHiringforCompanyService', async (req, res) => {
    const serviceType = req.body.service;
    const salary = req.body.salary;
    const companyId = req.company._id;

    const existingService = await hiringCompany.findOne({ companyId, serviceType });
        
    if (existingService) {
        return res.redirect("/");
    }

    await hiringCompany.create({
        companyId,
        serviceType,
        salary,
    });

    const questions = Array.isArray(req.body['questions[]'])
        ? req.body['questions[]']
        : [req.body['questions[]']];

    const answers = questions.map((_, index) => {
        const answerKey = `answers[${index}][]`;
        return Array.isArray(req.body[answerKey])
            ? req.body[answerKey]
            : req.body[answerKey]
            ? [req.body[answerKey]]
            : [];
    });

    const correctOptions = Array.isArray(req.body['correctOption[]'])
        ? req.body['correctOption[]']
        : [req.body['correctOption[]']];

    const questionsData = questions.map((question, index) => ({
        question,
        answers: answers[index] || [],
        correctOption: correctOptions[index] || null,
    }));

    try {
        const fileName = `${companyId}_${serviceType}.txt`;
        const filePath = path.join(__dirname, 'data', fileName);

        await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure directory exists

        const fileContent = JSON.stringify(questionsData, null, 2); // Pretty format JSON
        await fs.writeFile(filePath, fileContent, 'utf8');

        console.log(`Questions saved to ${filePath}`);
        res.redirect('/');
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports=router;