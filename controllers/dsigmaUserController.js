const DsUser = require('../models/dsigma/dsigmaUser');
const bcrypt = require('bcrypt');
const Employee = require('../models/company/branch/employee/employee');
const jwt = require('jsonwebtoken');
const AdminFlag = require('../models/dsigma/adminFlag')

exports.register_post = async(req, res)=>{
    try {
        const employee = await Employee.findOne({where:{email:req.body.email}});
        const dsUser = await DsUser.findOne({where:{email:req.body.email}});

        // Checking if the user already exists as an employee or DSuser
        if(!employee && !dsUser){
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
               const DSuser =  await DsUser.create({
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                DOB: req.body.DOB,
                password: hashedPassword,
                isAdmin: true,
                companyRegistered:false 
            });
            
            // Creating admins flag
            await AdminFlag.create({flag:"Signed Up", dsigmaUserId:DSuser.id});
            
            return res.status(200).json({success: true, message:`User has been successfully registered`});
        }else{
            return res.status(400).json({success: false, message:`This user already exists`})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message:`Something went wrong, Please try again later`});
    }
}

