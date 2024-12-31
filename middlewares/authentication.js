const {validateToken } = require("../services/authentication");
const {validateTokenforUser}=require('../services/userauth');
const {validateTokenforCompany}=require('../services/companyauth');

function checkForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        const tokenCookieValue=req.cookies[cookieName];
        if(!tokenCookieValue){
            return next();
        }
        try{
            const userPayload=validateTokenforUser(tokenCookieValue);
            req.user=userPayload;
        }        
        catch(error){
        }
        return next();
    }
}

function checkForCompanyAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        
        if (!tokenCookieValue) {
            return next();
        }
        try {

            const companyPayload = validateTokenforCompany(tokenCookieValue);
            req.company = companyPayload;
        } catch (error) {

        }
        return next();
    };
}

module.exports={
    checkForAuthenticationCookie,
    checkForCompanyAuthenticationCookie
}