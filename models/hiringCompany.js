const {Schema,model}=require('mongoose');
const hiringCompanySchema=new Schema({
    companyId:{
        type:String,
        required:true,
    },
    serviceType:{
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true,
    }

},{timestamps:true});



const hiringCompany=model('hiringCompany',hiringCompanySchema);

module.exports=hiringCompany;