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

function createTokenForCompany(company){
    const payload={
        _id:company._id,
        fullName:company.fullName,
        email:company.email,
        profileImage:company.profileImage,
    };
    const token=JWT.sign(payload,secret);
    return token;
}

function validateToken(token){
    const payload=JWT.verify(token,secret);
    return payload;
}

module.exports={
    createTokenForUser,
    createTokenForCompany,
    validateToken
}