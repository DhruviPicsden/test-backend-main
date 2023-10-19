const DsUser = require('../models/dsigma/dsigmaUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/company/branch/employee/employee');
const Branch = require('../models/company/branch/branch');
const Company = require('../models/company/company');
const Flag = require('../models/company/branch/employee/flag');
const EmployeeRole = require('../models/company/rolesAndPermissions/employeeRole');
const AdminFlag = require('../models/dsigma/adminFlag');
const { transporter } = require("../utils/transporter");
const otpGenerator = require('../utils/otpGenerator');
const OTP = require('../models/company/otp');
const Module = require('../models/company/module');
const Permission = require('../models/company/rolesAndPermissions/permission');
const permissionService = require('../utils/permissionService');
const { Sequelize } = require('sequelize');
const loginHistory = require('../models/company/branch/employee/loginHistory');




// DSigma User Login
exports.DsUser_login_post = async (req, res) => {
    try {
        // Checking if email and password exists in request
        if (req.body.email && req.body.password) {
            // fetching DsUser
            var dsUser = await DsUser.findOne({
                where: {
                    email: req.body.email
                },
                include: [{
                    model: Company, include: [{ model: Branch }]
                }, { model: AdminFlag }]
            });
            // Checking if DsUser exists.
            if (!dsUser) {
                return res.status(400).json({ success: false, message: "Incorrect Credentials" });
            } else {
                var branchName = await Branch.findOne({ where: { id: dsUser.currentBranchId } });
            }
        } else {
            return res.status(400).json({
                success: false, message: `Empty input`
            });
        }
        // validating password
        if (dsUser && await bcrypt.compare(req.body.password, dsUser.password)) {
            // generating JWT token
            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({ user: dsUser.email }, key, {
                expiresIn: '30d'
            });
            // Checking if DsUser has signed Up
            if (dsUser.adminFlag.flag === "Signed Up") {
                return res.status(200).json({
                    success: true, user: dsUser.email, isAdmin: dsUser.isAdmin,
                    companyRegistered: dsUser.companyRegistered,
                    currentBranchId: null,
                    flag: dsUser.adminFlag.flag, JWT_TOKEN: accessToken,
                    companyName: null,
                    companyId: null,
                    branchName: null
                });
            } else {
              return res.status(200).json({
                    success: true,
                    user: dsUser.email,
                    isAdmin: dsUser.isAdmin,
                    companyRegistered: dsUser.companyRegistered,
                    currentBranchId: dsUser.currentBranchId,
                    flag: dsUser.adminFlag.flag,
                    JWT_TOKEN: accessToken,
                    companyName: dsUser.company.name,
                    companyId: dsUser.company.id,
                    branchName: branchName ? branchName.name : null,
                    branchLogo: branchName ? branchName.logo : null
                });
            }

        } else {
            return res.status(400).json({ success: false, message: `Incorrect Credentials` });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Something went wrong, Please try again later` });
    }
}

// Employee Login
exports.emp_login_post = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ success: false, message: "Please don't leave the fields empty" });
        }

        // Fetching employee
        const AllEmployees = await Employee.findAll({
            where: {
                email: req.body.email
            },
            include: [
                {
                    model: Flag,
                    attributes: ['flag']
                }
            ]
        });

        // Check if there are any matching employees
        if (AllEmployees.length === 0) {
            return res.status(404).json({ success: false, error: 'Employee not found with matching email' });
        }

        // Iterate through the employees and find a match
        let employee = AllEmployees.find(emp => emp.currentBranchId === emp.branchId);
        if (!employee) {
            return res.status(404).json({ success: false, error: 'Employee not found with matching branch and email' });
        }
        let permissionData = await permissionService.getPermissionsByRoleId(employee.roleId);
       

          //IF permissionData is empty then create new permissionData
          if (Object.keys(permissionData).length === 0) {
            const modules = await Module.findAll();
            await Promise.all(modules.map(async module => {
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
        permissionData = await permissionService.getPermissionsByRoleId(employee.roleId);
       

        // Fetching associated branch
        const branch = await Branch.findOne({ where: { id: employee.currentBranchId } });

        // Fetching associated Company
        const company = await Company.findOne({ where: { id: branch.companyId } });

        // Verify the password (can be of any employee)
        const passwordMatches = await Promise.all(AllEmployees.map(async (emp) => {
            return emp.password && await bcrypt.compare(req.body.password, emp.password);
        }));
        //if any of password is null set first login to true
        let firstLogin = false;
        const loginHistoryData = await loginHistory.findOne({ where: { email: employee.email } });
        if (!loginHistoryData) {
            firstLogin = true;
        }
        if(loginHistoryData && loginHistoryData.changedDefaultPassword === null){
            firstLogin = true;
        }




        // loginHistory.create({
        //     email: employee.email,
        //     employeeId: employee.id,
        //     branchId: employee.currentBranchId,
        //     loginTime: new Date()

        // });
        //if fisrt login then set default password to true
        if (firstLogin) {
            loginHistory.create({
                email: employee.email,
                employeeId: employee.id,
                branchId: employee.currentBranchId,
                loginTime: new Date(),
            });
        }else{
            loginHistory.create({
                email: employee.email,
                employeeId: employee.id,
                branchId: employee.currentBranchId,
                loginTime: new Date(),
                changedDefaultPassword: true
            });
        }


        if (!passwordMatches.includes(true)) {
            // Returning error
            return res.status(401).json({
                success: false,
                message: "Incorrect Credentials"
            });
        }

        // Generating JWT token
        const key = process.env.ACCESS_TOKEN_SECRET;
        const accessToken = jwt.sign({ user: employee.email }, key, {
            expiresIn: '30d'
        });

        return res.status(200).json({
            success: true,
            user: employee.email,
            flag: employee.flag.flag,
            JWT_TOKEN: accessToken,
            currentBranchId: employee.currentBranchId,
            isAdmin: employee.isAdmin,
            branchId: employee.branchId,
            employeeId: employee.id,
            branchName: branch.name,
            branchLogo: branch.logo,
            companyName: company.name,
            noOfBranches: AllEmployees.length,
            permissionData: permissionData,
            firstLogin: firstLogin,
            companyId: company.id
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}


// Dsigma user forget password 
exports.DsigmaUserSendOTP_post = async (req, res) => {
    try {
        // fetching DsUser
        const DSuser = await DsUser.findOne({ where: { email: req.body.email } });
        // Checking if DsUser exists
        if (!DSuser) {
            return res.status(404).json({ success: false, message: "User not registered" });
        }
        // Generating OTP
        var generatedOTP = Math.floor(100000 + Math.random() * 900000);
        const otpInString = generatedOTP.toString();
        // Generating email content
        let mailOptions = {
            from: "noreply@dsigma.com.au",
            to: req.body.email,
            subject: "Reset your password",
            html: `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Forgot Password</title>
            </head>
            
            <body style="background-color: rgb(216, 216, 216);">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f7f7f7">
                    <tbody>
                        <tr>
                            <td valign="top" bgcolor="#f7f7f7" width="100%">
                                <table width="100%" role="content-container" align="center" cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                                    style="width:100%;max-width:600px" align="center">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td role="modules-container" style="padding:0px 0px 0px 0px;color:#111111;text-align:left" 
                                                                            bgcolor="#FFFFFF" width="100%" align="left">
                                                                                <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td height="100%" valign="top"
                                                                                                role="module-content">
                                                                                                <table cellspacing="0"
                                                                                                    cellpadding="0" align="center"
                                                                                                    valign="middle"
                                                                                                    style="width:100%;height:60px;background:#000000;margin:0px;padding:0px">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td height="60"
                                                                                                                align="center"
                                                                                                                valign="middle"
                                                                                                                style="width:60px;height:60px">
                                                                                                                <img width="60"
                                                                                                                    height="60"
                                                                                                                    style="display:block;border:0px;outline:none;height:100%;max-height:60px;width:100%;max-width:60px"
                                                                                                                    src="https://i.ibb.co/92b6sFp/logo.png"
                                                                                                                    >
                                                                                                            </td>
                                                                                                            <td height="60"
                                                                                                                align="center"
                                                                                                                valign="middle"
                                                                                                                style="line-height:100%">
                                                                                                                <h1
                                                                                                                    style="vertical-align:middle;line-height:100%;text-align:center;font-family:helvetica,sans-serif;font-weight:bold;font-size:21px;color:#fff;margin:0px;padding:0px">
                                                                                                                    Criniti's</h1>
                                                                                                            </td>
                                                                                                            <td height="60"
                                                                                                                align="center"
                                                                                                                valign="middle"
                                                                                                                style="width:60px;height:60px">
                                                                                                                
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="padding:18px 20px 10px 20px;line-height:40px;text-align:inherit"
                                                                                                height="100%" valign="top"
                                                                                                bgcolor="" role="module-content">
                                                                                                <div>
                                                                                                    <h1
                                                                                                        style="text-align:center;line-height:26px;margin-top:10px">
                                                                                                        <span
                                                                                                            style="color:#000000;line-height:28px;font-size:24px;font-family:helvetica,sans-serif">You have requested to reset your password
                                                                                                        </span>
                                                                                                    </h1>
                                                                                                    <div></div>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                 <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td height="100%" valign="top"
                                                                                                role="module-content">
                                                                                                <div style="margin:0 50px">
                                                                                                    <table
                                                                                                        style="font-family:helvetica,sans-serif;text-align:center;width:100%">
                                                                                                        <tbody>
                                                                                                            <tr
                                                                                                                style="background:#efefef">
                                                                                                                <td
                                                                                                                    style="padding:20px;background:#eeeeee">
                                                                                                                    <div
                                                                                                                        style="font-family:inherit;text-align:center">
                                                                                                                        <h3
                                                                                                                            style="text-align:center">
                                                                                                                            <img style="vertical-align:middle;margin-right:15px"
                                                                                                                                src="https://ci3.googleusercontent.com/proxy/WCQ0Ev1uf06swPOR8_PcFYFE9ZP7bF6eRw7XvTvPo-04DAQYbXBUKcZ4b7dNRKv6-pLvuocNqKMI51-2xV8GciYIfqp6qFWVpUAIadYXALI1qCINf3Bzowr4oSmKSZjg4e2KV6ZRzvHPmS3eQpyL6qyrnXigA5G2iP6QPM2B2ztDKTo=s0-d-e1-ft#http://cdn.mcauto-images-production.sendgrid.net/f9f5f46be8acedab/e57d63cd-adac-4311-bb56-1524ab99dc8d/32x32.png"
                                                                                                                                alt="lock"
                                                                                                                                height="20"
                                                                                                                                width="20">Your OTP is : </h3>
                                                                                                                    </div>
                                                                                                                    <div style="font-family:inherit;text-align:center">
                                                                                                                        <p style="color:#000000;letter-spacing:4px;margin-bottom:30px; font-weight: 600;font-size: 24px">
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[0]}</span>
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[1]}</span>
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[2]}</span>
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[3]}</span>
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[4]}</span>
                                                                                                                            <span style="background-color: #fff; padding: 3px;">${otpInString[5]}</span>
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="padding:10px 40px 20px 40px;line-height:20px;text-align:inherit;background-color:#ffffff"
                                                                                                height="100%" valign="top"
                                                                                                bgcolor="#ffffff"
                                                                                                role="module-content">
                                                                                                <div>
                                                                                                    <div
                                                                                                        style="font-family:inherit;text-align:center">
                                                                                                        <span style="font-family:helvetica,sans-serif">
                                                                                                            If you didn't request a password reset, you can ignore this mail, your password won't be changed.
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        
                                                                                    </tbody> 
                                                                                </table>
                                                                                <table role="module" border="0" cellpadding="0"
                                                                                    cellspacing="0" width="100%"
                                                                                    style="table-layout:fixed">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td height="100%" valign="top"
                                                                                                role="module-content">
                                                                                                <div
                                                                                                    style="text-align:center;background:#f7f7f7;padding:20px">
                                                                                                    <a href="https://app.dsigma.net"
                                                                                                        title="DSigma App"
                                                                                                        target="_blank"
                                                                                                        data-saferedirecturl="https://app.dsigma.net"><img
                                                                                                            height="30" width="auto"
                                                                                                            style="max-height:30px;height:30px"
                                                                                                            src="https://i.ibb.co/stpsdH3/dsigma-logo.png"
                                                                                                            ></a>
                                                                                                    <p
                                                                                                        style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;font-weight:bold;margin-bottom:0px">
                                                                                                        DSIGMA PTY LTD.
                                                                                                    </p>
                                                                                                    <p
                                                                                                        style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;margin-bottom:0px">
                                                                                                        Restaurant &amp; Business
                                                                                                        Management Software</p>
                                                                                                    <p
                                                                                                        style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px">
                                                                                                        Learn how you can simplify
                                                                                                        and transform your business
                                                                                                        today!</p>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
            
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
            
            </html>
            `
        }
        // Sending Email
        transporter.sendMail(mailOptions, async function (err, info) {
            // Handling Transporter Error
            if (err) {
                console.log(err);
                return res.status(400).json({ success: false, message: `Activation mail not sent & user is not Activated, please try again later` });
            } else {
                // Creating OTP entry
                const otpCreation = await OTP.create({
                    otp: generatedOTP,
                    dsUser: true,
                    userId: DSuser.id
                });
                return res.status(200).json({ success: true, message: `OTP has been sent to the email: ${req.body.email}` })
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, message: `Something went wrong, Please try again later` });
    }
}

// Employee Forget Password
exports.employeeSendOTP_post = async (req, res) => {
    // Fetching Employee
    try{ 
    const allEmp = await Employee.findAll({ where: { email: req.body.email } });
    let data = allEmp.find(emp => emp.currentBranchId === emp.branchId);
    if (!data) {
        return res.status(404).json({ success: false, message: "User not registered" });
    }
    else {
    // Employee.findOne({ where: { email: req.body.email, branchId:Sequelize.col('employee.currentBranchId') }})
    //     .then((data) => {
            // checking if employee exists
            
            // Generating OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpInString = otp.toString();
            // Generating email content
            let mailOptions = {
                from: "noreply@dsigma.com.au",
                to: req.body.email,
                subject: "Reset your password",
                html: `
            <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
</head>

<body style="background-color: rgb(216, 216, 216);">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f7f7f7">
        <tbody>
            <tr>
                <td valign="top" bgcolor="#f7f7f7" width="100%">
                    <table width="100%" role="content-container" align="center" cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                            <tr>
                                <td width="100%">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="width:100%;max-width:600px" align="center">
                                                        <tbody>
                                                            <tr>
                                                                <td role="modules-container" style="padding:0px 0px 0px 0px;color:#111111;text-align:left" 
                                                                bgcolor="#FFFFFF" width="100%" align="left">
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <table cellspacing="0"
                                                                                        cellpadding="0" align="center"
                                                                                        valign="middle"
                                                                                        style="width:100%;height:60px;background:#000000;margin:0px;padding:0px">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="width:60px;height:60px">
                                                                                                    <img width="60"
                                                                                                        height="60"
                                                                                                        style="display:block;border:0px;outline:none;height:100%;max-height:60px;width:100%;max-width:60px"
                                                                                                        src="https://i.ibb.co/92b6sFp/logo.png"
                                                                                                        >
                                                                                                </td>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="line-height:100%">
                                                                                                    <h1
                                                                                                        style="vertical-align:middle;line-height:100%;text-align:center;font-family:helvetica,sans-serif;font-weight:bold;font-size:21px;color:#fff;margin:0px;padding:0px">
                                                                                                        Criniti's</h1>
                                                                                                </td>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="width:60px;height:60px">
                                                                                                    
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:18px 20px 10px 20px;line-height:40px;text-align:inherit"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="" role="module-content">
                                                                                    <div>
                                                                                        <h1
                                                                                            style="text-align:center;line-height:26px;margin-top:10px">
                                                                                            <span
                                                                                                style="color:#000000;line-height:28px;font-size:24px;font-family:helvetica,sans-serif">You have requested to reset your password
                                                                                            </span>
                                                                                        </h1>
                                                                                        <div></div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                     <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <div style="margin:0 50px">
                                                                                        <table
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;width:100%">
                                                                                            <tbody>
                                                                                                <tr
                                                                                                    style="background:#efefef">
                                                                                                    <td
                                                                                                        style="padding:20px;background:#eeeeee">
                                                                                                        <div
                                                                                                            style="font-family:inherit;text-align:center">
                                                                                                            <h3
                                                                                                                style="text-align:center">
                                                                                                                <img style="vertical-align:middle;margin-right:15px"
                                                                                                                    src="https://ci3.googleusercontent.com/proxy/WCQ0Ev1uf06swPOR8_PcFYFE9ZP7bF6eRw7XvTvPo-04DAQYbXBUKcZ4b7dNRKv6-pLvuocNqKMI51-2xV8GciYIfqp6qFWVpUAIadYXALI1qCINf3Bzowr4oSmKSZjg4e2KV6ZRzvHPmS3eQpyL6qyrnXigA5G2iP6QPM2B2ztDKTo=s0-d-e1-ft#http://cdn.mcauto-images-production.sendgrid.net/f9f5f46be8acedab/e57d63cd-adac-4311-bb56-1524ab99dc8d/32x32.png"
                                                                                                                    alt="lock"
                                                                                                                    height="20"
                                                                                                                    width="20">Your OTP is : </h3>
                                                                                                        </div>
                                                                                                        <div style="font-family:inherit;text-align:center">
                                                                                                            <p style="color:#000000;letter-spacing:4px;margin-bottom:30px; font-weight: 600;font-size: 24px">
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[0]}</span>
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[1]}</span>
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[2]}</span>
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[3]}</span>
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[4]}</span>
                                                                                                                <span style="background-color: #fff; padding: 3px;">${otpInString[5]}</span>
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:10px 40px 20px 40px;line-height:20px;text-align:inherit;background-color:#ffffff"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="#ffffff"
                                                                                    role="module-content">
                                                                                    <div>
                                                                                        <div
                                                                                            style="font-family:inherit;text-align:center">
                                                                                            <span style="font-family:helvetica,sans-serif">
                                                                                                If you didn't request a password reset, you can ignore this mail, your password won't be changed.
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            
                                                                        </tbody> 
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <div
                                                                                        style="text-align:center;background:#f7f7f7;padding:20px">
                                                                                        <a href="https://app.dsigma.net"
                                                                                            title="DSigma App"
                                                                                            target="_blank"
                                                                                            data-saferedirecturl="https://app.dsigma.net"><img
                                                                                                height="30" width="auto"
                                                                                                style="max-height:30px;height:30px"
                                                                                                src="https://i.ibb.co/stpsdH3/dsigma-logo.png"
                                                                                                ></a>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;font-weight:bold;margin-bottom:0px">
                                                                                            DSIGMA PTY LTD.
                                                                                        </p>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;margin-bottom:0px">
                                                                                            Restaurant &amp; Business
                                                                                            Management Software</p>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px">
                                                                                            Learn how you can simplify
                                                                                            and transform your business
                                                                                            today!</p>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
            `
            }
            // If mail not sent then it will not activate
            transporter.sendMail(mailOptions, async function (err, info) {
                // Handling Transporter Error
                if (err) {
                    console.log(err);
                    return res.status(400).json({ success: false, message: `Activation mail not sent & user is not Activated, please try again later` });
                } else {
                    // Updating Flag
                    OTP.create({
                        otp: otp,
                        dsUser: false,
                        userId: data.id
                    }).then((data) => {
                        return res.status(200).json({ success: true, message: `OTP has been sent to the email: ${req.body.email}` });
                    });

                }
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, message: `Something went wrong, Please try again later` });
    }

    
}


// OTP Confirmation
// exports.otpConfirmation_post = (req, res) => {
//     try {
//         // checking if otp and email exists in req
//         if (req.body.otp && req.body.email) {
//             // Fetching OTP
//             OTP.findOne({ where: { otp: req.body.otp, used: false } }).then((otp) => {
//                 // Checking if OTP and dsUser = true
//                 if (otp && otp.dsUser) {
//                     // Fetching DsUser
//                     DsUser.findOne({ where: { email: req.body.email } })
//                         .then((dsUser) => {
//                             if (!dsUser) {
//                                 return res.status(404).json({ success: false, message: "User with this email does not exist" })
//                             }
//                             // Generating JWT
//                             const key = process.env.ACCESS_TOKEN_SECRET;
//                             const accessToken = jwt.sign({ user: dsUser.email, dsUser: true, otp: req.body.otp }, key, {
//                                 expiresIn: '5m'
//                             });
//                             return res.status(200).json({ success: true, JWT_TOKEN: accessToken });
//                         });
//                     // checking if OTP exists and DsUser = false
//                 } else if (otp && !otp.dsUser) {
//                     // Employee.findOne({ where: { email: req.body.email , branchId:Sequelize.col('employee.currentBranchId')} })
//                     //     .then((employee) => {
//                     //         if (!employee) {
//                     //             return res.status(404).json({ success: false, message: "User with this email does not exist" });
//                     //         }
//                     //         // Generating JWT
//                     //         const key = process.env.ACCESS_TOKEN_SECRET;
//                     //         const accessToken = jwt.sign({ user: employee.email, dsUser: false, otp: req.body.otp }, key, {
//                     //             expiresIn: '5m'
//                     //         });
//                     //         return res.status(200).json({ success: true, JWT_TOKEN: accessToken });
//                     //     })
//                     const employees = Employee.findAll({ where: { email: req.body.email } });
//                     const data = employees.find(emp => emp.currentBranchId === emp.branchId);

//                     if(!data){
//                         return res.status(404).json({ success: false, message: "User with this email does not exist" });
//                     }else{
//                         // Generating JWT
//                         const key = process.env.ACCESS_TOKEN_SECRET;
//                         const accessToken = jwt.sign({ user: data.email, dsUser: false, otp: req.body.otp }, key, {
//                             expiresIn: '5m'
//                         });
//                         return res.status(200).json({ success: true, JWT_TOKEN: accessToken });
//                     }
//                 } else {
//                     return res.status(401).json({ success: false, message: `Invalid OTP` });
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 return res.status(400).json({ success: false, message: "Something went wrong, Please try again later" });
//             })
//         } else {
//             return res.status(404).json({ success: false, message: "Invalid Input" });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" });
//     }

// }
exports.otpConfirmation_post = async (req, res) => {
    try {
        if (req.body.otp && req.body.email) {
            const otp = await OTP.findOne({ where: { otp: req.body.otp, used: false } });

            if (otp && otp.dsUser) {
                const dsUser = await DsUser.findOne({ where: { email: req.body.email } });
                if (!dsUser) {
                    return res.status(404).json({ success: false, message: "User with this email does not exist" });
                }

                const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({ user: dsUser.email, dsUser: true, otp: req.body.otp }, key, {
                    expiresIn: '5m'
                });
                return res.status(200).json({ success: true, JWT_TOKEN: accessToken });
            } else if (otp && !otp.dsUser) {
                const employees = await Employee.findAll({ where: { email: req.body.email } });
                const data = employees.find(emp => emp.currentBranchId === emp.branchId);

                if (!data) {
                    return res.status(404).json({ success: false, message: "User with this email does not exist" });
                } else {
                    const key = process.env.ACCESS_TOKEN_SECRET;
                    const accessToken = jwt.sign({ user: data.email, dsUser: false, otp: req.body.otp }, key, {
                        expiresIn: '5m'
                    });
                    return res.status(200).json({ success: true, JWT_TOKEN: accessToken });
                }
            } else {
                return res.status(401).json({ success: false, message: `Invalid OTP` });
            }
        } else {
            return res.status(404).json({ success: false, message: "Invalid Input" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" });
    }
}


// Setting new password
exports.newPassword_post = async (req, res) => {
    try {
        // check  if the otp is used or not
        if (req.body.password && req.body.confirmPassword && req.user && req.body.password === req.body.confirmPassword) {
            // Fetching DsUser and Employee
            const dsUser = await DsUser.findOne({ where: { email: req.user } });
            const employee = await Employee.findOne({ where: { email: req.user } });
            // Generating hash password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            // fetching Unused OTP
            const otp = await OTP.findOne({ where: { otp: req.payload.otp, used: false } });
            // checking if OTP exists
            if (!otp) {
                return res.status(400).json({ success: false, message: "OTP has expired" });
            }
            // checking if DsUser exists
            if (dsUser) {
                // Updating new password
                await DsUser.update({ password: hashedPassword }, { where: { email: req.user } });
                // Updating OTP status to used
                await OTP.update({ used: true }, { where: { otp: req.otp, userId: DsUser.id } })
                return res.status(200).json({ success: true, message: "Your password has been changes successfully" });

                // checking if Employee Exists 
            } else if (employee) {
                await Employee.update({ password: hashedPassword }, { where: { email: req.user } });
                await OTP.update({ used: true }, { where: { otp: otp.otp, userId: employee.id } })
                return res.status(200).json({ success: true, message: "Your password has been changes successfully" });
            } else {
                return res.status(400).json({ success: false, message: "Bad method call" });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: false, message: "Something went wrong, Please try again later" });
    }
}

exports.defaultPasswordChange = async (req, res) => {
    try{
        if(req.body.password && req.body.confirmPassword && req.user && req.body.password === req.body.confirmPassword){
            const loginHistoryData = await loginHistory.findOne({ where: { email: req.user } });
            if(!loginHistoryData){
                return res.status(404).json({ success: false, message: "User with this email does not exist" });
            }

            const employees = await Employee.findAll({ where: { email: req.user } });
            const data = employees.find(emp => emp.currentBranchId === emp.branchId);
            if(!data){
                return res.status(404).json({ success: false, message: "User with this email does not exist" });
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await Employee.update({ password: hashedPassword }, { where: { email: req.user } });
            //set default password change status to true
            await loginHistory.update({ changedDefaultPassword: true }, { where: { email: req.user } });
            return res.status(200).json({ success: true, message: "Your password has been changes successfully" });
        }
        else{
            return res.status(400).json({ success: false, message: "Bad method call" });
        }
    }
    catch(error){
        console.log(error);
        return res.status(200).json({ success: false, message: "Something went wrong, Please try again later" });
    }
}
