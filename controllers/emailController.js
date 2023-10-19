const nodemailer = require('nodemailer');
const Employee = require("../models/company/branch/employee/employee");
const Flag = require("../models/company/branch/employee/flag");
const output = require('../utils/output');
const email = require('../utils/email');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const pinGenerator = require('../utils/pinGenerator')
const {transporter} = require("../utils/transporter");
const Branch = require('../models/company/branch/branch');
const Role = require('../models/company/rolesAndPermissions/role');
const DSuser = require('../models/dsigma/dsigmaUser');
const Department = require('../models/company/rolesAndPermissions/department');
const Module = require('../models/company/module');
const Permission = require('../models/company/rolesAndPermissions/permission');
const permissionService = require('../utils/permissionService');


exports.email_post = async(req, res)=>{
  try {
    let name = ""
    if(req.userType === "DSuser"){
        const dsUser = await DSuser.findOne({where:{email:req.user}});
        name = `${dsUser.firstName} ${dsUser.lastName}`
        // console.log("DATA",dsUser);
        // console.log("NOT SO FINAL VALUE",name)
    }else{
        // const emp = await Employee.findOne({where:{email:req.user}, include:[{model:EmployeeDetails}]});
        const empAll = await Employee.findAll({where:{email:req.user}, include:[{model:EmployeeDetails}]});
        const emp = empAll.find(emp => emp.currentBranchId === emp.branchId);
        name = `${emp.employeeDetail.fname} ${emp.employeeDetail.lname}`
    }
    let mailOptions = {
      from: `noreply@dsigma.com.au`,
      to: req.body.email,
      subject: `DSigma: New Employee Invitation for ${req.body.email.toLowerCase()}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DSigma Email</title>
      </head>
      <body style="background-color: rgb(201, 201, 201);">
          <header>
              
          </header>
      
      <table style="margin: auto; background-color: white;">
          <tbody>
              <tr>
                  <td id="logo" style="display:block; text-align: center;">
                      <img src="https://i.im.ge/2022/06/19/re2zMa.png" alt="DSigma logo" width="150px">
                  </td>
              </tr>
              <tr>
                  <th style="font-size:20px; padding: 10px;">Hi ${req.body.email.toLowerCase()}</th>
              </tr>
              <tr style="text-align: center;">
                  <td style="text-align:center;">You have been invited by <strong>${name}</strong> to join DSigma</td>
              </tr>
      
              <tr style="text-align: center;">
                      <td>
                          <table style="text-align: center; margin: auto; border: 3px solid;">
                              <tr>
                              <th style="padding: 10px; font-size:20px" >
                                  New to DSigma? 
                               </th>
                              </tr>
                              <tr>
                               <td style="text-align:center;">
                                   If you don't have an account please
                               </td>
                              </tr>
                              <tr>
                               <td style="text-align:center; padding: 10px;">
                              <a href="https://app.dsigma.com.au/signup">
                               <button style="background-color:black; color:white; padding: 5px; border-radius: 5px;">Register Now</button>
                              </a> 
                              </td>
                              </tr>
                          </table>
                      </td>
              </tr>
      
              <tr>
                  <td style="text-align:center; padding: 10px;">NEED HELP?</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 10px">Please click the <u>"Sign Up"</u>. tab to create your account once you click the register link provided.</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 10px">Having troubles creating an account or signing in, please contact the DSigma<br>team by email, <u>support@dsigma.com.au</u>, our team will gladly assit you.</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 15px"><img src="https://dsigma.net/assets/images/dsigma-logo.png" alt="Dsigma logo" width="100px"></td>
              </tr>
              <tr>
                  <td style="text-align:center;"><strong>DSigma LLP.</strong></td>
              </tr>
              <tr>
                  <td style="text-align:center;">Restaurant & Business Management Software</td>
              </tr>    
              <tr>    
                  <td style="text-align:center;">Learn how you can simplify and transform your business today!</td>
              </tr>
          </tbody>   
      </table>
      
      </body>
      </html>`
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        return res.status(400).json({success: false, message: `Employee added successfully, Email not sent`});
      } 
      
      
    });
      // Fetching BASIC Role Id
        const role = await Role.findOne({where:{
          role: 'Basic',
          branchId: req.params.branchId
        }});
        if(!role){
            return res.status(500).json({success: false, message: 'No Basic Role Found'});
          }
        let permissionData = await permissionService.getPermissionsByRoleId(role.id);
       

          //IF permissionData is empty then create new permissionData
        if (Object.keys(permissionData).length === 0) {
            const modules = await Module.findAll();
            await Promise.all(modules.map(async module => {
                console.log("Creating permission for module:", module);
                try {
                    await Permission.create({
                        roleId: employee.roleId,
                        moduleId: module.id,
                        read: false,
                        write: false,
                        delete: false
                    });
                } catch (error) {
                    console.error("Error creating permission for module:", module, error);
                }
            }));
        }

        
        const dept = await Department.findOne({where:{
            department: 'Basic',
            branchId: req.params.branchId
        }});
        if(!dept){
            return res.status(500).json({success: false, message: 'No Basic Department Found'});
        }


    //   Generating Employee PIN 
        const pin  = await pinGenerator.userPinGen();
        var email = await Employee.create({
            email: req.body.email.toLowerCase(),
            pin:pin,
            branchId: req.params.branchId,
            roleId: role.id,
            shiftStatus: "Not Working",
            currentBranchId: req.params.branchId,
            isAdmin: false,
            deptId: dept.id
            // isBranchManager: false
        });

        const empAll = await Employee.findAll({where:{email:req.body.email.toLowerCase()}});
        empAll.forEach(async (emp)=>{
            //set the currentBranchId to the branchId of the last employee created
            emp.currentBranchId = email.branchId;
            await emp.save();
        }
        )
        

        //Creating Status Flag 
        const flag = await Flag.create({
            flag:"Email Sent",
            user_id: email.id,
            employeeId: email.id
        });


        // Creating Employee Details Table
        await EmployeeDetails.create({workEmail: req.body.email.toLowerCase(), userId: email.id, employeeId: email.id})
        return res.status(200).json({
          success: true,
          message: `Mail has been successfully sent to ${req.body.email.toLowerCase()}`
        });
    } catch (error) {
        console.log(`post Employee error: ${error}`);
        //if empyee creation fails, delete the flag and employee
        // await Flag.destroy({where:{user_id:email.id}});
        // await Employee.destroy({where:{id:email.id}});
        // await EmployeeDetails.destroy({where:{userId:email.id}});
        if(error.name === "SequelizeUniqueConstraintError"){
            return res.status(400).json({
                success:false,
                message: "This user has already been invited"
            });
        }
        return res.status(500).json({
            success:false,
            message:'Server Error please try again later'
        });
    }
   

}


