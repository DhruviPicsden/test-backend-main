require('dotenv').config();
const jwt = require('jsonwebtoken');
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const DsUser = require('../models/dsigma/dsigmaUser');
const Employee = require('../models/company/branch/employee/employee')

module.exports = async(req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        console.log("No req.headers found")
        return res.status(401).json({ message: "You must be logged in" });
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET, async(err, payload) => {
        try {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: "You must be logged in" });
            }
            const { user } = payload;
            // console.log(user);
            const admin = await DsUser.findOne({where:{email:user}});
            const employeeAll = await Employee.findAll({where:{email:user}});
            let employee = employeeAll.find(emp => emp.currentBranchId === emp.branchId);


            if(admin && admin.isAdmin == true){
                req.user = admin.email;
                req.currentBranchId = admin.currentBranchId;
                req.userType = "DSuser";
                next();
            }else if(employee && employee.isAdmin == true){
                req.user = user;
                req.currentBranchId = employee.currentBranchId;
                req.userType = "Employee";
                next();
            }else{
                return res.status(500).json({success:false, message: `Not Authorized`});
            }
        } catch (error) {
            return res.status(500).json({success:false, message:`isAdmin ERROR: ${error.message}`});
        }
    });
}