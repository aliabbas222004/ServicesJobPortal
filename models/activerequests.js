const {Schema,model}=require('mongoose');
const { type } = require('os');
const activeRequestSchema=new Schema({
    
    userId:{
        type:String,
        required:true,
    },
    companyId:{
        type:String,
        required:true,
    },
    serviceType:{
        type:String,
        required:true,
    },
    marks:{
        type:Number,
        required:true,
    }

},{timestamps:true});


const ActiveRequests=model('activerequest',activeRequestSchema);

module.exports=ActiveRequests;