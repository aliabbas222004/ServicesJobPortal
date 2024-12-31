const JWT=require('jsonwebtoken');

const secret="BMZA@azmb22";

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

function validateTokenforCompany(token){
    const payload=JWT.verify(token,secret);
    return payload;
}

module.exports={
    createTokenForCompany,
    validateTokenforCompany
}