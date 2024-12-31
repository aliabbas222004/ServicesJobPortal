const {Schema,model}=require('mongoose');
const { createHmac,randomBytes } = require('crypto');
const { createTokenForCompany } = require('../services/authentication');
const { type } = require('os');
const CompanyServices = require('./companyServices');
const hiringCompany = require('./hiringCompany');
const ActiveRequests = require('./activerequests');
const BookedService = require('./bookedservice');
const companySchema=new Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImage:{
        type:String,
        default:'/pictures/defaultProfile.jpeg'
    },
    companyType:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    }


},{timestamps:true});

companySchema.pre('save',function (next){
    const company=this;

    if(!company.isModified('password'))    return;

    const salt=randomBytes(16).toString();
    const hashedPass=createHmac('sha256',salt).
                        update(company.password).
                        digest("hex");

    this.salt=salt;
    this.password=hashedPass;
    next();
});

companySchema.static('matchPasswordAndGenerateToken',async function (email,password){
    const company=await this.findOne({email});
    if(!company)   throw new Error('Company not found');
    console.log(company);
    const salt=company.salt;
    const hashedPass=company.password;
    
    const newHashedPass=createHmac('sha256',salt).update(password).
    digest("hex");
    
    if(hashedPass!==newHashedPass)  throw new Error('Incorrect Password');
    
    const token=createTokenForCompany(company);
    // const cid=company._id;
    const services=await CompanyServices.findOne({companyId:company._id});
    const hiringServices=await hiringCompany.findOne({companyId:company._id});
    const activerequests=await ActiveRequests.find({companyId:company._id});
    const activeservices=await BookedService.find({companyId:company._id});
    // console.log(services);
    // return token;

    return {token,services,company,hiringServices,activerequests,activeservices};
});

const Company=model('company',companySchema);

module.exports=Company;