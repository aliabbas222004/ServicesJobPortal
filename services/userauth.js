const JWT=require('jsonwebtoken');

const secret="BMZA@azmb22";

function createTokenForUser(user){
    const payload={
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profileImage:user.profileImage,
    };
    const token=JWT.sign(payload,secret);
    return token;
}

function validateTokenforUser(token){
    const payload=JWT.verify(token,secret);
    return payload;
}

module.exports={
    createTokenForUser,
    validateTokenforUser
}