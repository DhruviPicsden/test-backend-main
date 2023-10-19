const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const DsigmaUser = require('./dsigma/dsigmaUser');
const Company = require('./company/company');
const Branch = require('./company/branch/branch');
const Employee = require('./company/branch/employee/employee');
const EmployeeDetails = require('./company/branch/employee/employeeDetails');
const Flag = require('./company/branch/employee/flag');
const Shift = require('./company/branch/shift/shift');
const ShiftTimeline = require('./company/branch/shift/shiftTimeline');
const Role = require('./company/rolesAndPermissions/role');
const Department = require('./company/rolesAndPermissions/department');
const Module = require("./company/module");
const Permission = require("./company/rolesAndPermissions/permission");
const EmployeeRole = require("./company/rolesAndPermissions/employeeRole");
const EmployeeTimeline = require("./company/branch/employee/employeeTimeline");
const AdminFlag = require("./dsigma/adminFlag");
const OTP = require("./company/otp");
const ScheduleItem = require('./company/branch/ScheduleItem');
// Relationships:

// DSigmaUser & company
DsigmaUser.hasOne(Company);
Company.belongsTo(DsigmaUser);

// DSigmaUser & AdminFlag
DsigmaUser.hasOne(AdminFlag);
AdminFlag.belongsTo(DsigmaUser);

// Company & Branch
Company.hasMany(Branch);
Branch.belongsTo(Company);

// Branch & Employee
Branch.hasMany(Employee);
// Employee.hasMany(Branch);


// Employee & EmployeeDetails
Employee.hasOne(EmployeeDetails);
EmployeeDetails.belongsTo(Employee);

// Employee & Flag
Employee.hasOne(Flag);
Flag.belongsTo(Employee)

// Employee & Shift
Employee.hasMany(Shift);
Shift.belongsTo(Employee);

// Employee & EmployeeTimeline
Employee.hasMany(EmployeeTimeline);
EmployeeTimeline.belongsTo(Employee);

// Shift & Timeline
Shift.hasMany(ShiftTimeline);
ShiftTimeline.belongsTo(Shift);

// Branch & Roles
Branch.hasMany(Role);
Role.belongsTo(Branch);

// Branch & Department
Branch.hasMany(Department);
Department.belongsTo(Branch);

// Employee & Roles
// Employee.hasOne(Role);

// Modules & Roles
Role.belongsToMany(Module, { through: Permission });
Module.belongsToMany(Role, { through: Permission });

// Employee & Roles
Employee.hasOne(EmployeeRole);
EmployeeRole.belongsTo(Employee);
Role.hasMany(EmployeeRole);
Employee.belongsTo(Role, { foreignKey: 'roleId' });


// Employee & Department
//Employee.hasOne(Department);
Employee.belongsTo(Department, { foreignKey: 'deptId' });



//Employee and schedule
ScheduleItem.belongsTo(Employee)
ScheduleItem.belongsTo(Employee, { foreignKey: "employeeId" });   


//  This will check for the errors in DB connection
 sequelize.authenticate()
 .then(()=>{
     console.log('connected to PostgreSQL DB on port 5432');
 })
 .catch(err=>{
    console.log(`Database Error ${err}`);
 });

 const db = {};
 db.Sequelize = Sequelize;
 db.sequelize = sequelize;


db.sequelize.sync({alter: true})
// db.sequelize.sync({force: false})
.then(()=>{
   console.log("successfully Synced all the models");
})
.catch(err=>{
   console.log(`DB sync Error: ${err.message}`)
})

