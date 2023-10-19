require('dotenv').config();
const jwt = require('jsonwebtoken')
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET
const Employee = require("../models/company/branch/employee/employee");
const DsigmaUser = require("../models/dsigma/dsigmaUser");
const Role = require('../models/company/rolesAndPermissions/role');
const Permission = require("../models/company/rolesAndPermissions/permission");
const Module = require('../models/company/module');
const moduleName = 'Bookings';

module.exports = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ message: "You must be logged in" })
        }
        // const {user} = payload
        const token = authorization.replace("Bearer ", "")
        jwt.verify(token, JWT_SECRET, async(err, payload) => {
            if (err) {
                return res.status(401).json({ message: "You must be logged in" })
            }
            // checking if the user is Admin
            if(req.isAdmin){
                return next();
            }
            const employee = await Employee.findOne({where:{email: req.user}});
            const permission = await Permission.findOne({where:{roleId:employee.roleId, moduleId:2}});
            console.log(permission.toJSON());
            if(permission.write === true){
                next();
            }else{
                return res.status(401).json({success:false, message:`Unauthorized User`});
            }
            console.log(`FROM SECOND MIDDLEWARE ${req.role}`);
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success:false, message:`checkPermission Error: ${error.message}`});
    }
}