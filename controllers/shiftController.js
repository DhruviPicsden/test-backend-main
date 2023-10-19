const Employee = require('../models/company/branch/employee/employee');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const ShiftTimeline = require('../models/company/branch/shift/shiftTimeline');
const Shift = require('../models/company/branch/shift/shift');
const Flag = require('../models/company/branch/employee/flag');
const { Op } = require('sequelize');
const DSuser = require('../models/dsigma/dsigmaUser');
const Department = require('../models/company/rolesAndPermissions/department');
const moment = require('moment');
const { totalBreakTime, timeGap, convertSecToTime } = require('../utils/timeCalculator');


// GET SHIFT (TESTED)
exports.shift_get = async(req,res)=>{
    try {
        // Checking if shift exists
        const shift = await Shift.findOne({where:{id: req.params.shiftId}, include:[{model:ShiftTimeline}]});
        if(shift){
            // fetching user associated with shift
            const employee = await Employee.findOne({where:{id:shift.employeeId},  attributes:['id'], include:[{model:EmployeeDetails, attributes:['fname', 'lname']}]});
            // console.log(employee.toJSON())
            let user = {};
            user['id'] = employee.id;
            user['name'] = employee.employeeDetail.fname.concat(' ', employee.employeeDetail.lname);
            return res.status(200).json({success: true, shift:shift, employee:user});
        }
        return res.status(400).json({success: false, message:`Bad request`});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: `Something went wrong`});
    }
    
}

// GET SHIFTS (TESTED)
exports.shifts_post = async (req,res)=>{
    try {
        const dbTimezoneOffset = '+05:30';  // Adjust this based on your database timezone
        const startDate = moment(req.body.startDate).toISOString();
        const endDate = moment(req.body.endDate).endOf('day').toISOString();

        // Convert start and end dates to the same timezone as the database
        const startDateInDBTimezone = moment(startDate).utcOffset(dbTimezoneOffset, true).toDate();
        const endDateInDBTimezone = moment(endDate).utcOffset(dbTimezoneOffset, true).toDate();
        // const shiftsData = Shift.findAll({})
        
        // shiftsData.forEach(shift => {
        //     if(shift.break != null){
        //         shift.totalBreak = totalBreakTime(shift.break);
        //     }
        //     Shift.update({totalBreak:shift.totalBreak}, {where:{id:shift.id}});
        // })
        //finad all shifts then update totalBreak


        ////***********impppppppp************
        // Shift.findAll().then(shifts => {
        //     shifts.forEach(shift => {
        //         if(shift.break != null){
        //             shift.totalBreak = totalBreakTime(shift.break);
        //         }
        //         let shiftWithoutBreak = timeGap(shift.totalShiftLength, shift.totalBreak);
        //         shift.shiftWithoutBreak = convertSecToTime(shiftWithoutBreak);
        //         Shift.update({totalBreak:shift.totalBreak}, {where:{id:shift.id}});
        //         Shift.update({shiftWithoutBreak:shift.shiftWithoutBreak}, {where:{id:shift.id}});
        //     })
        // })
        ////***********impppppppp************


        //update shift to database with totalBreak
        

        // fetching all the users of the branch with their shifts
        const users = await Employee.findAll({where:{branchId:req.currentBranchId}, 
            order:[['createdAt', 'DESC']],
        attributes: ['email','createdAt', 'id', 'roleId', 'deptId'], 
        include: [ 
            {
            model: Flag, 
             where:{flag:'Active'}, attributes: ['flag']
            },
            {model:EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
            {model: Shift, where:{"startTime" : {[Op.between] : [startDateInDBTimezone , endDateInDBTimezone ]}},include:[{model: ShiftTimeline}]},
            {model: Department, attributes:['department']}
        ]
    });

        const shiftsByDepartment = {};
        users.forEach(user => {
            const department = user.department.department;
            if (!shiftsByDepartment[department]) {
                shiftsByDepartment[department] = [];
            }
            shiftsByDepartment[department].push(user);
            let shiftMetadata = {};
            let approvedTime;
            let unapprovedTime;
            user.shifts.forEach(shift => {
                if(shift.status === "Completed"){
                    approvedTime = shift.totalShiftLength;
                }else{
                    unapprovedTime = shift.totalShiftLength;
                }
            }   
            );
        });
        return res.status(200).json({
            success: true,
            shiftsByDepartment
        });



        
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Something went wrong'});
    }
}

// CREATE SHIFT (TESTED)
exports.createShift_post = async(req,res)=>{
    try {
        // Checking if the Employee associated with shift exists.
        const user = Employee.findOne({where:{id:req.params.empId}});
        if(user){
            // Validating if break attribute is array.
            if(Array.isArray(req.body.break)&& user){
                    await Shift.create({
                        employeeId: req.params.empId,
                        startTime: req.body.startTime,
                        endTime: req.body.endTime,
                        startDate: req.body.startDate,
                        endDate: req.body.endDate,
                        approved: true, 
                        status: "Completed",
                        break: req.body.break,
                        shiftWithoutBreak: req.body.shiftWithoutBreak,
                        totalShiftLength: req.body.totalShiftLength,
                        totalBreak: req.body.totalBreak,
                        startImage: 'N/A',
                        endImage:'N/A'
    
                    });
                    return res.json({success:true, message:`Shift has been created`});
            }else{
                return res.status(400).json({success: false, message:"Bad request"});
            }
            
        }else{
            return res.status(400).json({success: false, message:"Bad request"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:`Something went wrong`});
    }
    }

// EDIT SHIFT (NOT TESTED)
exports.shiftEdit_patch = async(req,res)=>{
    try {
        if(req.body.id || req.body.createdAt || req.body.updatedAt || req.body.employeeId || req.body.endImage || req.body.startImage){
            return res.status(400).json({success: false, message:"Bad Request"});
        }
        const shift = await Shift.findOne({where: {id:req.params.shiftId}});
        
        // Checking if the shift exists & shift status is not Active
        if (shift) {
            // Fetching logged in user
            // let updatedBy = "";
            if(shift.status != "Active"){
                if(req.userType ==="Employee"){
                    const updatedBy = await Employee.findOne({where:{email: req.user}, include:[{model:EmployeeDetails}]});
                    // checking if the shift is Active & endTime exists in body 
                    if(shift.status === "Active" && req.body.endTime){
                        
                        //changing employees shiftStatus and shifts status
                        Shift.update(req.body,{where:{id:req.params.shiftId}})
                        .then(async() => {
                            await ShiftTimeline.create({employeeId: updatedBy.id, 
                                shiftId: req.params.shiftId, 
                                message:`Shift has been updated by ${updatedBy.employeeDetail.fname} ${updatedBy.employeeDetail.lname}`
                            });
                            await Employee.update({shiftStatus:"Not Working"}, {where:{id:shift.employeeId}});
                            await Shift.update({status:"Completed"}, {where:{id:shift.id}});
            
                        })
                        return res.status(200).json({success:true, message:"Shift updated successfully"});
        
                    } else{
                        
                        // Updating shift
                        Shift.update(req.body,{where:{id:req.params.shiftId}})
                        .then(async() => {
                            await ShiftTimeline.create({employeeId: updatedBy.id, 
                                shiftId: req.params.shiftId, 
                                message:`Shift has been updated by ${updatedBy.employeeDetail.fname} ${updatedBy.employeeDetail.lname}`
                            });
            
                        })
                        return res.status(200).json({success:true, message:"Shift updated successfully"});
                    }
                }else if(req.userType === "DSuser"){
                    const updatedByAdmin = await DSuser.findOne({where:{email: req.user}});
                                    // checking if the shift is Active & endTime exists in body 
                                    if(shift.status === "Active" && req.body.endTime){
                        
                                        //changing employees shiftStatus and shifts status
                                        Shift.update(req.body,{where:{id:req.params.shiftId}})
                                        .then(async() => {
                                            await ShiftTimeline.create({dsUserId: updatedByAdmin.id, 
                                                shiftId: req.params.shiftId, 
                                                message:`Shift has been updated by ${updatedByAdmin.firstName} ${updatedByAdmin.lastName}`
                                            });
                                            await Employee.update({shiftStatus:"Not Working"}, {where:{id:shift.employeeId}});
                                            await Shift.update({status:"Completed"}, {where:{id:shift.id}});
                            
                                        })
                                        return res.status(200).json({success:true, message:"Shift updated successfully"});
                        
                                    } else{
                                        
                                        // Updating shift
                                        Shift.update(req.body,{where:{id:req.params.shiftId}})
                                        .then(async() => {
                                            await ShiftTimeline.create({dsUserId: updatedByAdmin.id, 
                                                shiftId: req.params.shiftId, 
                                                message:`Shift has been updated by ${updatedByAdmin.firstName} ${updatedByAdmin.lastName}`
                                            });
                            
                                        })
                                        return res.status(200).json({success:true, message:"Shift updated successfully"});
                                    }
                }

            }else{
                return res.status(400).json({success:false, message:"Please wait until the shift ends"})
            }


        }else{
            return res.status(400).json({success:false, message:"Bad Request"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong"});        
    }
}

// APPROVE SHIFT (NOT TESTED)
exports.approve_patch = async(req, res)=>{
    try {
        // Fetching shift
        const shift = await Shift.findOne({where:{id:req.params.shiftId}});
        // checking if the shift exists
        if (shift) {
             Shift.update({approved: 'true'},{where:{id: req.params.shiftId}})
            .then(async(data)=>{
                if(req.userType === "Employee"){
                      Employee.findOne({where:{email: req.user}, include:[{model: EmployeeDetails}]})
                    .then(async(data)=>{
                        await ShiftTimeline.create({message:`Shift has been Approved by ${data.employeeDetail.fname} ${data.employeeDetail.lname}`,
                         employeeId:data.id,
                         shiftId: req.params.shiftId
                        });
    
                    })
                    
                }else{
                     DSuser.findOne({where:{email: req.user}})
                    .then(async(data)=>{
                        await ShiftTimeline.create({message:`Shift has been Approved by ${data.firstName} ${data.lastName}`,
                         dsUserId:data.id,
                         shiftId: req.params.shiftId                
                        });
    
                    })

                }

            })
            return res.status(200).json({success: true, message:`Shift has been approved`});
    }else{
        return res.status(400).json({success: false, message:`Bad Request`});
    }
    } catch (error) {
        console.error(error);
        return res.status(200).json({success: false, message:"Something went wrong"});
    }
}

// DELETE SHIFT (TESTED)
exports.shiftDelete_delete = async(req,res)=>{
    try {
        // Fetching shift
        const shift = await Shift.findOne({where:{id: req.params.shiftId}});
        if(shift.status === "Active"){
            return res.status(400).json({success: false, message:"Please wait for the shift to end"});
        }
        // Checking if the shift exists
        if (shift) {
            // checking if the shift is active
            if(shift.status === "Active"){
                // updating the employee shiftStatus to "Not Working"
                await Employee.update({shiftStatus:"Not Working"}, {where:{id:shift.employeeId}});
            }
            await ShiftTimeline.destroy({where:{shiftId:req.params.shiftId}});
            await Shift.destroy({where:{id:req.params.shiftId}});
            return res.status(200).json({success:true, message:`Shift has been deleted successfully`});
            
        }else{
            return res.status(400).json({success:false, message:`Bad Request`});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:"Something went wrong"});
    }
}