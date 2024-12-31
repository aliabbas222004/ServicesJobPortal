const {Schema,model}=require('mongoose');
const { type } = require('os');
const bookServiceSchema=new Schema({
    userId:{
        type:String,
        required:true,
    },
    companyId:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
    timeforservice:{
        type:String,
        required:true,
    }

},{timestamps:true});

const BookedService=model('bookedservice',bookServiceSchema);

module.exports=BookedService;