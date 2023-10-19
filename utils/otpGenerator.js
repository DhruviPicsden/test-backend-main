const OTP = require('../models/company/otp');
module.exports.otpGenerator = async function otpGenerator(){
    do {
        var fiveDigitNumber = Math.floor(100000 + Math.random() * 900000);
        var otp = await OTP.findOne({where:{otp:fiveDigitNumber, used:false}});
        // console.log(otp) 
    } while (otp !== null);
    return fiveDigitNumber;
}