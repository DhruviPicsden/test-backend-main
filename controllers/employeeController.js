const EmployeeDetails = require("../models/company/branch/employee/employeeDetails");
const Role = require("../models/company/rolesAndPermissions/role");
const Department = require("../models/company/rolesAndPermissions/department");
const Flag = require("../models/company/branch/employee/flag");
const Employee = require("../models/company/branch/employee/employee");
const nodemailer = require('nodemailer');
const ou = require('../utils/output');
const bcrypt = require('bcrypt');
const {transporter} = require("../utils/transporter");
const EmployeeRole = require("../models/company/rolesAndPermissions/employeeRole");
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3-v2' );
const multer = require('multer');
const path = require( 'path' );
const DSuser = require( '../models/dsigma/dsigmaUser');
const AdminFlag = require('../models/dsigma/adminFlag');
const Branch = require("../models/company/branch/branch");
const Shift = require("../models/company/branch/shift/shift");
const { Op } = require("sequelize");
const ShiftTimeline = require("../models/company/branch/shift/shiftTimeline");




// S3 Instance
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  Bucket: 'dsigma-employee-files'
});

// Check File Type Function
function checkFileType( file, cb ){
  // console.log(file)
// Allowed ext
const filetypes = /pdf|doc|docx|txt|rtf|jpg|png/;
// Check ext
const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
// Check mime
const mimetype = filetypes.test( file.mimetype );
if( mimetype && extname ){
  return cb( null, true );
} else {
  cb( 'Error: pdf,doc,docx,txt,rtf,jpg,png Only!' );
}
}

// Upload Files Function
const uploadsBusinessGallery = multer({
storage: multerS3({
  s3: s3,
  bucket: 'dsigma-employee-files',
  // acl: 'public-read',
  key: function (req, file, cb) {
    cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
  }
}),
limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
fileFilter: function( req, file, cb ){
  checkFileType( file, cb );
}
}).array( 'files', 3 );

//Employee Details Form (NOT TESTED) (Only mail Not working)
exports.form_post = async(req,res)=>{   

  try {
    const user = await Employee.findOne({where:{
      email: req.user
    },
    include:{
      model: Flag,
      attributes: ['flag']
    }});

// if to check if the users flag is "Registered"
    if(user && user.flag.flag === "Registered"){
      
  //  Uploading files to aws s3 
      uploadsBusinessGallery( req, res, async ( error ) => {
        if( error ){
          console.log( 'errors', error );
          return res.status(500).json({success: false, message:"Something went wrong, please try again later" });
        } else {
          // If File not found
          console.log(req.files)
          if( req.files === undefined ){
            console.log( 'Error: No File Selected!' );
                        // If Success
                        let fileArray = req.files,
                        fileLocation;
                      var galleryImgLocationArray = [];
                      for ( let i = 0; i < fileArray.length; i++ ) {
                        fileLocation = fileArray[ i ].location;
                        galleryImgLocationArray.push( fileLocation )
                      }
          
                // Inserting EMP details
                      await EmployeeDetails.update({
                        userId: user.id,
                // Info
                        title: req.body.title,
                        fname: req.body.fname,
                        lname: req.body.lname,
                        workEmail: req.body.workEmail,
                        personalEmail: user.email,
                        mobNumber: req.body.mobNumber,
                // Personal Info
                        DOB: req.body.DOB,
                        maritalStatus: req.body.maritalStatus,
                        gender: req.body.gender,
                        medicareNumber: req.body.medicareNumber,
                        driversLicense: req.body.driversLicense,
                        passportNumber: req.body.passportNumber,
                        address: req.body.address,
                        address2: req.body.address2,
                        city: req.body.city,
                        state: req.body.state,
                        postCode: req.body.postCode,
                        Country: req.body.country,
                // Bank Details
                        bankName:req.body.bankName,
                        BSB: req.body.BSB,
                        accountNumber: req.body.accountNumber,
                // TAX INFO
                        taxFileNumber: req.body.taxFileNumber,
                // Working Rights
                        workingRights: req.body.workingRights,
                // Primary Contact
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        mobile: req.body.mobile,
                        workPhone: req.body.workPhone,
                        contactType: req.body.contactType,
                // Secondary Contact
                        sfname: req.body.sfname,
                        slname: req.body.slname,
                        semail: req.body.semail,
                        smobNo: req.body.smobNo,
                        sworkNo: req.body.sworkNo,
                        scontactType: req.body.scontactType,
                        linkedIn: req.body.linkedIn,
                // Files
                        file1: "N/A",
                        file2: "N/A",
                        file3: "N/A",
                      },{where:{userId: user.id}});
                
                // Updating Flag
                      await Flag.update({flag: 'Onboarding'}, {where:{user_id: user.id}});
          } else {
            // If Success
            let fileArray = req.files,
              fileLocation;
            var galleryImgLocationArray = [];
            for ( let i = 0; i < fileArray.length; i++ ) {
              fileLocation = fileArray[ i ].location;
              galleryImgLocationArray.push( fileLocation )
            }

      // Inserting EMP details
            await EmployeeDetails.update({
              userId: user.id,
      // Info
              title: req.body.title,
              fname: req.body.fname,
              lname: req.body.lname,
              workEmail: req.body.workEmail,
              personalEmail: user.email,
              mobNumber: req.body.mobNumber,
      // Personal Info
              DOB: req.body.DOB,
              maritalStatus: req.body.maritalStatus,
              gender: req.body.gender,
              medicareNumber: req.body.medicareNumber,
              driversLicense: req.body.driversLicense,
              passportNumber: req.body.passportNumber,
              address: req.body.address,
              address2: req.body.address2,
              city: req.body.city,
              state: req.body.state,
              postCode: req.body.postCode,
              Country: req.body.country,
      // Bank Details
              bankName:req.body.bankName,
              BSB: req.body.BSB,
              accountNumber: req.body.accountNumber,
      // TAX INFO
              taxFileNumber: req.body.taxFileNumber,
      // Working Rights
              workingRights: req.body.workingRights,
      // Primary Contact
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              mobile: req.body.mobile,
              workPhone: req.body.workPhone,
              contactType: req.body.contactType,
      // Secondary Contact
              sfname: req.body.sfname,
              slname: req.body.slname,
              semail: req.body.semail,
              smobNo: req.body.smobNo,
              sworkNo: req.body.sworkNo,
              scontactType: req.body.scontactType,
              linkedIn: req.body.linkedIn,
      // Files
              file1: galleryImgLocationArray[0],
              file2: galleryImgLocationArray[1],
              file3: galleryImgLocationArray[2],
            },{where:{userId: user.id}});
      
      // Updating Flag
            await Flag.update({flag: 'Onboarding'}, {where:{user_id: user.id}});
      
      
          }
        }
      });
     
      // const output = ou.onboardingOutput(req.body)

                        try {
                        //   let transporter = nodemailer.createTransport({
                        //     service: 'gmail',
                        //     auth: {
                        //       user: "dev.dsigma@gmail.com",
                        //       pass: "wisypdnzdhcvjngj",
                        //     },
                        //   });
                          
                        //   let mailOptions = {
                        //     from: 'dsigmatesting@gmail.com',
                        //     to: req.body.email,
                        //     subject: `Dashify: New Employee Invitation for ${req.body.email}`,
                        //     html: output,
                            
                        //   };
                          
                        //   transporter.sendMail(mailOptions, function (err, info) {
                        //     if (err) {
                        //      console.log(`Something went wrong while sending email: ${err}`)
                        //     } else {
                        //       console.log("Email sent successfully")
                        //     }
                        //   });
                        // //   console.log(result)
                          return res.status(200).json({
                            success: true,
                            message: "Thank you for completing the form Your manager is notified and will contact you"
                          });
                          // return result;
                        } catch (error) {
                          console.log(`Error while sending Email: ${error}`);
                          return res.status(500).json({
                            success: false,
                            message: "Server Error",
                          });
                        }
    }else{
      return res.status(404).json({
        success: false,
        message: "Invalid user"
      });
    }


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
}


// All Employees (Tested)
exports.employees_get = async(req,res)=>{
  try {
    // check if deptId exists in employee table
    // const check = await Employee.findOne({where:{email:req.user}});
    // console.log(check)
    // if(!check.deptId || check.deptId === null || check.deptId === undefined){
    //   // if not then assign basic department
    //   const basicDept = await Department.findOne({where:{branchId: req.currentBranchId, department:"Basic"}});
    //   await Employee.update({deptId:basicDept.id}, {where:{branchId: req.currentBranchId}});
    // }
    const basicDept = await Department.findOne({where:{branchId: req.currentBranchId, department:"Basic"}});
    if(!basicDept){
      await Department.create({department:"Basic", branchId: req.currentBranchId});
    }

  // const employees = await Employee.findAll({where:{branchId: req.currentBranchId},
  //   order:[['createdAt', 'DESC']],
  //   attributes: ['email','createdAt', 'id'],
  //   include: [
  //             {model: EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
  //             {model:Flag, attributes:['flag']},
  //             {
  //           model: Department,
  //           attributes: ['department', 'id']
  //       },
  //       {
  //         model: Role,
  //         attributes: ['role', 'id']
  //       }
  //   ]
  // });
  //from EmplyeeBranch
  // const employees = await Employee.findAll({
  //   order:[['createdAt', 'DESC']],
  //   attributes: ['email','createdAt', 'id'],
  //   include: [
  //             {model: EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
  //             {model:Flag, attributes:['flag']},
  //             {model: Department, attributes: ['department', 'id']},
  //             {model: Role, attributes: ['role', 'id']},
  //   ]
  //   where: {id: req.currentBranchId},
  // });

  const employees = await Employee.findAll({
    order:[['createdAt', 'DESC']],
    attributes: ['email','createdAt', 'id'],
    where: {branchId: req.currentBranchId},
    include: [
              {model: EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
              {model:Flag, attributes:['flag']},
              {model: Department, attributes: ['department', 'id']},
              {model: Role, attributes: ['role', 'id']},
    ]
  });


  // employees.forEach((employee)=>{
  //   //if deptId is null then assign basic department
  //   if(!employee.department.id){
  //     Employee.update({deptId:basicDept.id}, {where:{id:employee.id}});
  //   }
  // }
  // )


    return res.status(200).json({
      success:true,
      employees: employees
    })
    // Handling Error's
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }

}



// Updating Employee (Tested)
exports.employee_patch = async(req,res)=>{
  try {
    // Fetching SignedIn user
    const dsUser = await DSuser.findOne({where:{email:req.user}});
    const emp = await Employee.findOne({where:{email:req.user}});

    if(dsUser){

      if(req.body.pin){
        await Employee.update({pin:req.body.pin}, {where:{id:req.params.empId}});
      }

      // Checking if flag exists
        if(req.body.flag){
           await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
           await Flag.update({flag:req.body.flag}, {where:{employeeId:req.params.empId}});
           return res.status(201).json({
             success: true,
             message: "Details updated successfully"
           });
        }


  
        await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
        return res.status(201).json({
          success: true,
          message: "Details updated successfully"
        })
//  checking if the employee being edited and employee editing are same  
    }
    else if(emp && emp.id == req.params.empId || emp.isAdmin === true){
      // Checking if flag exists
      if(req.body.flag){
        // Updating employee and its flag
        await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
        await Flag.update({flag:req.body.flag}, {where:{employeeId:req.params.empId}});
        return res.status(201).json({
          success: true,
          message: "Details updated successfully"
        });
     }

     await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
     return res.status(201).json({
       success: true,
       message: "Details updated successfully"
     })
    }else{
      return res.status(401).json({success: false, message:"Login required"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:"Server Error"
    });
  }
}


// Deleting Employee (Tested)
exports.employee_delete = async(req,res)=>{
  try {
    // Destroying Employee
    const employee = await Employee.destroy({where: {id: req.params.empId},truncate:true});
    // Destroying Employee Details
    const employeeDetails = await EmployeeDetails.destroy({where: {employeeId: req.params.empId},truncate:true});
    // Destroying employee Flag
    const U = await Flag.destroy({where: {employeeId: req.params.empId}, truncate:true});
    return res.json({
      d: employee,
      flag: U
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
}



// Fetching Single Employee (Tested)
exports.employee_get = async(req,res)=>{
  try {
    
    let result = {};
    const dsUser = await DSuser.findOne({where:{email:req.user}}); 
    // const emp = await Employee.findOne({where:{email:req.user}})
   // const AllEmployees = await Employee.findAll({ where: { email: req.user }, include: [{ model: Flag }] });

   // const emp = AllEmployees.find(emp => emp.currentBranchId === emp.branchId);

// fetching employee 
    const employee = await Employee.findOne({where:{id:req.params.empId}, 
    attributes: ['id', 'pin' , 'roleId', 'deptId'],
    include: [
             {model: EmployeeDetails,attributes:{exclude:['id', 'userId', 'createdAt', 'updatedAt']}},
             {model:Flag, attributes:['flag']},

       ]});
       if(employee){

         if(dsUser){
  
           result['user_id'] = employee.id;
           result['flag'] = employee.flag.flag;
           result['pin'] = employee.pin;
           const emp = employee.toJSON();
           const len = Object.keys(emp.employeeDetail).length;
           for (let i = 0; i < len; i++) {
             result[Object.keys(emp.employeeDetail)[i]] = Object.values(emp.employeeDetail)[i]
             
           }
           const role = await Role.findOne({where:{id:employee.roleId}});
            result['roleId'] = role.id;
            result['role'] = role.role;

           const dept = await Department.findOne({where:{id:employee.deptId}});
            result['deptId'] = dept.id;
            result['department'] = dept.department;

           return res.status(200).json({
          success: true,
          employee: result
        })
        // }else if(emp && emp.id === employee.id){
      }else if(employee){
          result['user_id'] = employee.id;
           result['flag'] = employee.flag.flag;
           result['pin'] = employee.pin;
           const emp = employee.toJSON();
           const len = Object.keys(emp.employeeDetail).length;
           for (let i = 0; i < len; i++) {
             result[Object.keys(emp.employeeDetail)[i]] = Object.values(emp.employeeDetail)[i]
             
           }

           // Fetching Role
            const role = await Role.findOne({where:{id:employee.roleId}});
            result['roleId'] = role.id;
            result['role'] = role.role;

            // Fetching Department
            const dept = await Department.findOne({where:{id:employee.deptId}});
            result['deptId'] = dept.id;
            result['department'] = dept.department;
    
           return res.status(200).json({
          success: true,
          employee: result
        })
         }else{ 
          return res.status(401).json({success: false, message:"Login required"});
         }
       }else{
        return res.status(404).json({success:false, message:"Bad Method Call"})
       }
// Rearranging
  } catch (error) {
    console.log(error);
    return res.status(500).json({success: false, message: "Server Error"});
  }
}


// Activating Employee (Tested)
exports.activateEmployee_patch = async (req, res)=>{
  try {
    var invitedByName="";

    // Checking UserType
    if(req.userType === "DSuser"){
      // fetching SentBy user
      const sentBy = await DSuser.findOne({where:{email: req.user}});
      invitedByName = `${sentBy.firstName} ${sentBy.lastName}` 
    }else{
      // Fetching SentBy user
      const sentBy = await Employee.findOne({where:{email:req.user}, include:[{model:EmployeeDetails}]});
      invitedByName = `${sentBy.employeeDetail.fName} ${sentBy.employeeDetail.lName}` 
    }

    // Fetching flag & employee
    const check = await Flag.findOne({where:{employeeId: req.params.empId}, include:[{model: Employee}]});

    // Checking if the flag is Active or Onboarding
    if(check && check.flag === 'Onboarding' || check.flag === 'Active' || check.flag === 'Inactive'){

      // Fetching Mail Content
      const content = ou.activationOutput(check.employee.pin.toString(), check.employee.email, invitedByName, req.user);

      // If mail not sent then it will not activate
      transporter.sendMail(content, async function (err, info) {
        // Handling Transporter Error
        if (err) {
          console.log(err);
          return res.status(400).json({success: false, message: `Activation mail not sent & user is not Activated, please try again later`});
        } else {
          // Updating Flag
          await Flag.update({flag:'Active'}, {where:{user_id:req.params.empId}});
          return res.status(200).json({
            success: true,
            message: `Activation mail has been successfully sent to ${check.employee.email}`
          });
        }
      });
    }else{
      if(check.flag === 'Email Sent'){
        return res.status(401).json({success:false, message:"Please ask the employee to register"});

      }else if(check.flag === 'Registered'){
        return res.status(401).json({success:false, message:"Please ask the employee to fill the required details"});
      }
      return res.status(500).json({success:false, message:"To activate the user the status of the user has to be Onboarding"});
    }
  } catch (error) {
    // Handling Error
    console.log(error);
    return res.status(500).json({success:false,message:"Something went wrong please try again later"});
  }

}


// Registering Employee (TESTED) 
exports.register_post = async(req,res)=>{
    try {
      // checking if password exists
        if(req.body.password){
          // hashing password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            // fetching employee
            const employee = await Employee.findOne({
              where:{
                email: req.body.email
              },
              include:{
                model: Flag,
                attributes: ['flag']
              }
            });
            // checking if the employee email exists
            if(employee){
              if(!employee.password){
                // updating user and its flag & branch
                const user = await Employee.update({password: hashedPassword}, {where:{email: req.body.email}});
                const flag = await Flag.update({flag: 'Registered'}, {where:{employeeId: employee.id}});
                const branchRoles = await Role.findOne({where:{role:"Basic", branchId: employee.branchId}});
                // Registering Employee's Role
                               await EmployeeRole.create({employeeId: employee.id, roleId:branchRoles.id })
                  return res.status(200).json({
                      success:true,
                      message: "You have successfully registered"
                  });

              }else{
                return res.status(400).json({success:false, message:"User has already been registered"})
              }
            } else{
                return res.status(404).json({
                    success:false,
                    message: 'No user found'
                });
            }
        }else{
            res.status(400).json({
                            success: false,
                            message: "passwords don't match"
                        });
        }
        // Handling Error's
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
    
}

exports.makeAdmin_post = async(req, res) => {
    try {
        // fetching the employee
        const employee = await Employee.findOne({where:{id: req.params.empId}, include:[{model:EmployeeDetails}]});
        if(employee){
          await Employee.update({isAdmin:true}, {where:{id:req.params.empId}});
          return res.status(200).json({success:true, message:`${employee.employeeDetail.fname} has been assigned the Admin Role`});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong, Please try again later"});
    }
}


exports.getShiftsByEmployeeId_get = async (req,res)=>{
  try {
      
      
    // fetching all the users of the branch with their shifts
      const users = await Employee.findOne({where:{id:req.params.empId},
      attributes: ['email','createdAt', 'id', 'roleId'], 
      include: [ 
          {
          model: Flag, 
           where:{flag:'Active'}, attributes: ['flag']
          },
          {model:EmployeeDetails, attributes:['fname', 'lname']},
          {model: Shift ,include:[{model: ShiftTimeline}]},
      ]
  });
      
      const shifts = [];
      users.shifts.forEach((shift) => {
        let obj = {};
        //convert 2023-09-14T15:00:54.000Z to 2023-09-14
        const date = shift.createdAt.toISOString().split('T')[0];
        if(shift.break && shift.break.length > 0 ){
          //convert 2023-09-14T15:00:54.000Z to 15:00:54
          let breaks = shift.break.map((brk) => {
            // return {
            //   // 2022-07-15T08:50:06.002Z to 08:50:06 and remove Z
            //   // start: brk.start.toISOString().split('T')[1].split('.')[0],
            //   // end: brk.end.toISOString().split('T')[1].split('.')[0]

            // }
            if(brk.start && brk.end){
              return {
                // 2022-07-15T08:50:06.002Z to 08:50:06 and remove Z
                start: brk.start.split('T')[1].split('.')[0],
                end: brk.end.split('T')[1].split('.')[0]
              }
            }
          });
          obj.break = breaks;
        }else{
          obj.break = [];
        }

        obj.date = date;  
        obj.startTime = shift.startTime.toISOString().split('T')[1].split('.')[0];
        if(shift.endTime){
          obj.endTime = shift.endTime.toISOString().split('T')[1].split('.')[0];
        }else{
          obj.endTime = null;
        }
        obj.totalBreak = shift.totalBreak;
        obj.totalShiftLength = shift.totalShiftLength;
        obj.shiftWithoutBreak = shift.shiftWithoutBreak;
        obj.approved = shift.approved;

        shifts.push(obj);
      });

      //sort the shifts by date
      shifts.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      return res.status(200).json({
          success:true,
          shifts: shifts
      })
  } catch (error) {
      console.error(error);
      return res.status(500).json({success: false, message: 'Something went wrong'});
  }
}
