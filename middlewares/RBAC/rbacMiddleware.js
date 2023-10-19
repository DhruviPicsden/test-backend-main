const Permission = require("../../models/company/rolesAndPermissions/permission");
const Employee = require("../../models/company/branch/employee/employee");
const Module = require("../../models/company/module");
const Role = require("../../models/company/rolesAndPermissions/role");
const DsUser = require('../../models/dsigma/dsigmaUser');


const checkPermission = async (employeeId, moduleId, action) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    const roleId = employee.roleId;

    if (!roleId) {
      return false; // Employee has no role assigned, deny access
    }

    const permission = await Permission.findOne({
      where: {
        roleId: roleId,
        moduleId: moduleId,
      },
    });

    if (!permission) {
      return false; // Role doesn't have permission for this module, deny access
    }

    return permission[action]; // Return the value for the specified action (read, write, delete)
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

const checkAccess = (action, moduleId) => async (req, res, next) => {
  const email = req.user; // Assuming you have middleware to set the user's email in the request

  try {
    // const employee = await Employee.findOne({ where: { email } });
    const EmpAll = await Employee.findAll({ where: { email } });
    const employee = EmpAll.find(emp => emp.currentBranchId === emp.branchId);
    const DSuser = await DsUser.findOne({ where: { email } });

    if (!employee && !DSuser) {
      return res.status(403).json({ error: 'Access denied.' });
    }

  let employeeId;
  if(employee){
    employeeId = employee.id;
  } 
   
    
    // Replace with the actual module ID for the specific route

    // Check if the accessed employee's data belongs to the same employee
    if (req.params.empId == employeeId || DSuser || employee.isAdmin == true) {
      return next(); // Same employee, allow access
    }

    const hasPermission = await checkPermission(employeeId, moduleId, action);

    if (hasPermission) {
      next(); // User has permission, proceed to the route
    } else {
      res.status(403).json({ error: 'Access denied.' });
    }
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};




module.exports = {
  checkAccess
};
