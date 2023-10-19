require('dotenv').config();
const jwt = require('jsonwebtoken')
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET
const Employee = require("../models/company/branch/employee/employee");
const DsigmaUser = require("../models/dsigma/dsigmaUser");
const Role = require('../models/company/rolesAndPermissions/role');
const Permission = require("../models/company/rolesAndPermissions/permission");
const Module = require('../models/company/module');
const moduleName = 'Bookings'

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ message: "You must be logged in" })
    }
    const token = authorization.replace("Bearer ", "")
    console.log(token)
    jwt.verify(token, JWT_SECRET, async(err, payload) => {
        try {
            if (err) {
                return res.status(401).json({ message: "You must be logged in" })
            }
            // const { user } = payload
            const employee = await Employee.findOne({where:{email:req.user},include:[
                {model:Role, attributes:['role']},
                {model:Permission}
            ]})
            // .then(userData => {
            //     req.user = userData.email
            //     next()
            // })
            const admin = await DsigmaUser.findOne({where:{email:user}});
            console.log(employee);
            // Checking if the user is an employee
            if (employee) {
                const role = await Role.findOne({where:{id:employee.roleId}, include:[
                    {model:Module}
                ]})
            // Checking if the userRole is not basic and if not basic then the modules he/she has access to are same as 
                if(role.role === 'Basic'){
                    return res.status(401).json({success:false, message:`Unauthorized User`});
                }else if(role.module === moduleName){
                    Console.log(`You have access to the module`);
                }else{
                    console.log(`You don't have access to the module`);
                }
                req.user = employee.email;
            // Checking If the user is Admin
            }else if (admin) {
                req.user = admin.email;
                next();
            }
            
        } catch (error) {
            console.error(error);
            return res.status(200).json({success:true, message:`checkRole ERROR: ${error.message}`});
        }
    })
}