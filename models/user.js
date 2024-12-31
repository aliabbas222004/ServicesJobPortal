const {Schema,model}=require('mongoose');
const { createHmac,randomBytes } = require('crypto');
const { createTokenForUser } = require('../services/authentication');
const userSchema=new Schema({
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
    city:{
        type:String,
        required:true,
    }
    

},{timestamps:true});

userSchema.pre('save',function (next){
    const user=this;

    if(!user.isModified('password'))    return;

    const salt=randomBytes(16).toString();
    const hashedPass=createHmac('sha256',salt).
                        update(user.password).
                        digest("hex");

    this.salt=salt;
    this.password=hashedPass;
    next();
});

userSchema.static('matchPasswordAndGenerateToken',async function (email,password){
    const user=await this.findOne({email});
    if(!user)   throw new Error('User not found');
    const salt=user.salt;
    const hashedPass=user.password;

    const newHashedPass=createHmac('sha256',salt).update(password).
        digest("hex");

    if(hashedPass!==newHashedPass)  throw new Error('Incorrect Password');
    
    const token=createTokenForUser(user);
    return token;
});

const User=model('user',userSchema);

module.exports=User;