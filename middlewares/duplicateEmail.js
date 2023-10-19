const Employee = require("../models/company/branch/employee/employee");
const DsigmaUser = require('../models/dsigma/dsigmaUser');


module.exports = async function duplicateEmail(req, res, next){
    try {
        // const employee = await Employee.findOne({where:{email: req.body.email}});
        const dsUser = await DsigmaUser.findOne({where:{email:req.body.email}});
        
        if(dsUser){
            return res.status(400).json({
                success:false,
                message: "This email is already being used by someone on this DSigma"
            });
        }
        Employee.findAll({where:{email:req.body.email}}).then((employees)=>{
            let repeat = false;
            employees.forEach((employee)=>{
                if(employee.branchId == req.params.branchId){
                    repeat = true;
                }
            });
            if(repeat){
                return res.status(400).json({
                    success:false,
                    message: "This user has already been invited"
                });
            } else{
                return next();
            }
        }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }
}