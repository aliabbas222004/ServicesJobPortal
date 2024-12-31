const {Schema,model}=require('mongoose');
const companyServices=new Schema({
    companyId:{
        type:String,
        required:true,
    },
    serviceType:{
        type:String,
        required:true,
    },
    serviceCharge:{
        type:Number,
        required:true,
    }
},{timestamps:true});

const CompanyServices=model('companyServices',companyServices);

module.exports=CompanyServices;