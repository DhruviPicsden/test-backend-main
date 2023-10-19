const Employee = require("../models/company/branch/employee/employee");
const Branch = require('../models/company/branch/branch');
const Company = require('../models/company/company');
const bcrypt = require('bcrypt');

module.exports.removeNonAlphabet = function removeNonAlphabet(str) {
      return str.replace(/[^a-zA-Z]/g, '');
    }
module.exports.userPinGen = async function userPinGen(){
    do {
        var pin = Math.floor(Math.random()*90000) + 10000;
        var employee = await Employee.findOne({where:{pin:pin}});

    } while (employee !== null);
    return pin

}

module.exports.branchPinGen = async function branchPinGen(){
   try {
       do {
           var branchPin = Math.floor(Math.random()*90000) + 100000;
        //    const hashedPassword = await bcrypt.hash(branchPin.toString(), 10);

           var branch = await Branch.findOne({where:{code:branchPin}});
           
        } while (branch !== null);
        // console.log(`---------------- ${branchPin} -----------------`)
        // console.log(`----------------- ${branch} -----------------------`)
       return branchPin    
       
   } catch (error) {
       console.error(`ERRROR FROM BRANCH PIN GEN ${error}`);
   }
}

module.exports.companyCodeGen = async function companyCodeGen(companyName){
    let emptyString = "";
    do {
        while (emptyString.length < 4) {
        emptyString += companyName[Math.floor(Math.random() * companyName.length)];
        }
        var company = await Company.findOne({where:{code:emptyString}}); 
    } while (company !== null);
    return emptyString.toUpperCase();
}

module.exports.branchCodeGen = async function (branchName){
    try {
        let emptyString = "";
        // do {
            while (emptyString.length < 2) {
            emptyString += branchName[Math.floor(Math.random() * branchName.length)];
            }
            // var branchCode = await Branch.findOne({where:{code:emptyString}}); 
        // } while (branchCode !== null);
        return emptyString.toUpperCase();
        
    } catch (error) {
        console.error(`ERROR FROM branchCodeGen ${branchCode}`)
    }
}
