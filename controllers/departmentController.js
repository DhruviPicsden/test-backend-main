const Department = require('../models/company/rolesAndPermissions/department');
const Employee = require('../models/company/branch/employee/employee');

exports.createDepartment_post = async(req,res)=>{
    try{
        const dept = await Department.create({
            department: req.body.department,
            description: req.body.description,
            branchId: req.params.branchId,
        });
        //send role creatd successfuly message
        res.status(200).json({success:true, message:"Department created successfully"});
    }catch(err){
        res.send(err);
}
}


exports.getDepartments_get = async(req,res)=>{
    try{
       if(req.params.branchId){
        const departments = await Department.findAll({
            where: {branchId: req.params.branchId}
        });
        res.send(departments);
    }else{
        res.send('Branch Id is required');
    }
    }catch(err){
        res.send(err);
}
}

exports.getDepartmentByEmployee_get = async(req,res)=>{
    try{
        const employee = await Employee.findOne({
            where: {id: req.params.empId}
        });
        const dept = await Department.findOne({
            where: {id: employee.deptId}
        });

        res.send(dept);
    }catch(err){
        res.send(err);
    }

}

exports.updateDepartment_put = async(req,res)=>{
    const role = await Department.update({
        department: req.body.department,
        description: req.body.description
    },{
        where: {id: req.params.id}
    });
    res.send(role);
}

exports.deleteDepartment_delete = async(req,res)=>{
    try{
        const employees = await Employee.findAll({
            where: {deptId: req.params.id}
        });

        const dept = await Department.findOne({
            where: {id: req.params.id}
        });
        if(dept.department === 'Basic'){
            res.status(400).json({success:false, message:"Basic department cannot be deleted"});
        }else if(employees.length === 0){
                await Department.destroy({
                    where: {id: req.params.id}
                });
                res.status(200).json({success:true, message:"Department deleted successfully"});
        }else if(employees.length > 0){
            //force delte link call eg. /department/deleteDepartment/1?forceDelete=true
            if(req.query.forceDelete === 'true'){
                //find department with name 'Basic' and haveing same deptId
                const basicDept = await Department.findOne({
                    where: {department: 'Basic', branchId: dept.branchId}
                });
                //assign basic department to all employees to whom department is assigned
                employees.forEach(async employee => {
                    await Employee.update({deptId:basicDept.id}, {where:{id:employee.id}});
                });

                await Department.destroy({
                    where: {id: req.params.id}
                });
                
                res.status(200).json({success:true, message:"Departmnet deleted successfully and basic department is assigned"});
            }else{
                //send mailids of employees to whom department is assigned
                let mailIds = [];
                employees.forEach(employee => {
                    mailIds.push(employee.dataValues.email);
                }
                );
                res.status(400).json({success:false, message:"Department is assigned to employees", mailIds:mailIds});
            }
        }
    }catch(err){
        res.send(err);
    }
}



// exports.getDepartmentByEmployee_get = async(req,res)=>{
//     try{
//         const employee = await Employee.findOne({
//             where: {id: req.params.id}
//         });
//         const role = await Role.findOne({
//             where: {id: employee.roleId}
//         });
//         res.send(role);
//     }catch(err){
//         res.send(err);
//     }
// }

exports.assignDepartment_post = async(req, res) => {
    try {
      // fetching the employee
      const dept = await Department.findOne({where:{id: req.body.deptId}});
      const employee = await Employee.findOne({where:{id: req.params.empId}});
      //update Emoloyee.roleId
      if(employee && dept){
        //if deptId of department and employee is same
        if(dept.branchId === employee.branchId){
  
        await Employee.update({deptId:req.body.deptId}, {where:{id:req.params.empId}});
        return res.status(200).json({success:true, message:`${dept.department} department has been assigned to ${employee.email}`});
        }else{
          return res.status(400).json({success:false, message:"Employee and department must belong to same branch"});
        }
      }else{
        return res.status(404).json({success:false, message:"Employee or department not found"});
      }
  } catch (error) {
      console.log(error);
      return res.status(500).json({success:false, message:"Something went wrong, Please try again later"});
  }
  
  }