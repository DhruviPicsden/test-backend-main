const Branch = require('../models/company/branch/branch');
const Company = require('../models/company/company');
const Role = require('../models/company/rolesAndPermissions/role');
const Department = require('../models/company/rolesAndPermissions/department');
const Permission = require('../models/company/rolesAndPermissions/permission');
const pinGenerator = require('../utils/pinGenerator');
const DSuser = require('../models/dsigma/dsigmaUser');
const AdminFlag = require('../models/dsigma/adminFlag');
const jwt = require('jsonwebtoken');
const Employee = require('../models/company/branch/employee/employee');
const Flag = require('../models/company/branch/employee/flag');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require("multer-s3-v2");
const permissionService = require('../utils/permissionService');
const Module = require('../models/company/module');


// Registering Branch
exports.register_post = async (req, res) => {
    try {
        // console.log(req.body);
        // fetching the company
        const company = await Company.findOne({ where: { id: req.params.companyId } });
        const dsUser = await DSuser.findOne({ where: { email: req.user }, include: [{ model: AdminFlag }] })

        // checking if company and branchName Exists
        if (req.body.name && company) {

            const code = await pinGenerator.branchPinGen();
            const branchName = pinGenerator.removeNonAlphabet(req.body.name);
            do {
                const bh = await pinGenerator.branchCodeGen(branchName);
                var kioskId = `${company.code}-${bh}`
                var kioskIdCheck = await Branch.findOne({ where: { kioskId: kioskId } })

            } while (kioskIdCheck !== null);

            const branch = await Branch.create({
                name: req.body.name,
                // description: req.body.description,
                companyId: req.params.companyId,
                code: code,
                kioskId: kioskId,
                ABN: req.body.ABN,
                website: req.body.website,
                phone: req.body.phone,
                email: req.body.email,
                location: req.body.location,
                address: req.body.address,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                postCode: req.body.postCode,
                country: req.body.country,
                facebook: req.body.facebook,
                instagram: req.body.instagram,
                linkedIn: req.body.linkedIn,
                twitter: req.body.twitter,
                bankName: req.body.bankName,
                BSB: req.body.BSB,
                accountNumber: req.body.accountNumber,
                employee: req.body.employee,
                logo: req.files.branchLogo[0].location,
            });
            const role = await Role.create({
                role: 'Basic',
                description: "Basic Access",
                branchId: branch.id
            });
            const modules = await Module.findAll();
            await Promise.all(modules.map(async module => {
                await Permission.create({
                    roleId: role.id,
                    moduleId: module.id,
                    read: false,
                    write: false,
                    delete: false
                });
            }));

            
            const dept = await Department.create({
                department: 'Basic',
                description: "Basic",
                branchId: branch.id
            });
            // console.log(req.user);
            const DsUser = await DSuser.update({ currentBranchId: branch.id }, { where: { email: req.user } });

            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({ user: dsUser.email }, key, {
                expiresIn: '30d'
            });

            // console.log("Ye File Hai",req.files.branchLogo[0])

            return res.status(200).json({
                success: true,
                message: `${branch.name} has been successfully created`,
                user: dsUser.email,
                isAdmin: dsUser.isAdmin,
                companyRegistered: dsUser.companyRegistered,
                currentBranchId: branch.id,
                JWT_TOKEN: accessToken,
                flag: dsUser.adminFlag.flag,
                companyName: company.name,
                companyId: company.id,
                branchName: branch.name,
                branchLogo: req.files.branchLogo[0].location
            });


        } else {
            return res.status(400).json({ success: false, message: "Bad request" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: `Something went wrong, Please try again later` });
    }
}

// Fetching all branches
exports.branches_get = async (req, res) => {
    try {
        if (req.userType === "DSuser") {
            DSuser.findOne({ where: { email: req.user }, include: [{ model: Company }] }).then((DSuser) => {
                Company.findOne({ where: { id: DSuser.company.id } })
                    .then(async (company) => {
                        const branches = await Branch.findAll({ where: { companyId: company.id } });
                        return res.status(200).json({ success: true, branches: branches });
                    });

            });

        } else if (req.userType === "Employee") {
            const employees = await Employee.findAll({ where: { email: req.user } });
            const branchPromises = employees.map(async (emp) => {
                const branch = await Branch.findOne({ where: { id: emp.branchId } });
                return branch;
            });
            const branches = await Promise.all(branchPromises);

            return res.status(200).json({ success: true, branches: branches });

            // if(employee){
            //     employee.forEach((emp)=>{
            //         Branch.findOne({where:{id:emp.branchId}}).then((branch)=>{
            //             branches.push(branch);
            //         })
            //     }).then(()=>{
            //         return res.status(200).json({success:true, branches:branches});
            //     }
            //     )
            // } 
        } else {
            return res.status(400).json({ success: false, message: "Bad Method Call" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" })
    }
}

// Switching Branch
exports.switchBranch_get = async (req, res) => {
    try {

        // check if the switched branch id Exists
        const branch = await Branch.findOne({ where: { id: req.params.branchId } });
        if (branch) {
            const company = await Company.findOne({ where: { id: branch.companyId } });
            const dsUser = await DSuser.findOne({ where: { email: req.user } });
            const employee = await Employee.findAll({ where: { email: req.user } });

            // check if the user is a DSigma user or an employee
            if (dsUser) {
                // update the branch id to the employee or dsUser
                await DSuser.update({ currentBranchId: branch.id }, { where: { id: dsUser.id } });
                const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({ user: dsUser.email }, key, {
                    expiresIn: '30d'
                });
                const user = await DSuser.findOne({ where: { id: dsUser.id }, include: [{ model: AdminFlag }] });
                // const company = await Company.findOne({where:{companyId: branch.companyId}});

                return res.status(200).json({
                    success: false,
                    message: `Successfully switched to ${company.name} - ${branch.name}`,
                    user: user.email,
                    isAdmin: user.isAdmin,
                    companyRegistered: user.companyRegistered,
                    currentBranchId: user.currentBranchId,
                    JWT_TOKEN: accessToken,
                    flag: user.adminFlag.flag,
                    companyName: company.name,
                    companyId: company.id,
                    branchName: branch.name,
                    branchLogo: branch.logo,
                })
            } else if (employee) {
                employee.forEach(async (emp) => {
                    await Employee.update({ currentBranchId: branch.id }, { where: { id: emp.id } });
                })
                
                const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({ user: req.user }, key, {
                    expiresIn: '30d'
                });
                const user = await Employee.findOne({ where: { email: req.user, branchId: branch.id }, include: [{ model: Flag }] });
                let permissionData = await permissionService.getPermissionsByRoleId(user.roleId);
                return res.status(200).json({
                    success: false,
                    message: `Successfully switched to ${company.name} - ${branch.name}`,
                    user: user.email,
                    isAdmin: user.isAdmin,
                    companyRegistered: user.companyRegistered,
                    currentBranchId: user.currentBranchId,
                    JWT_TOKEN: accessToken,
                    flag: user.flag.flag,
                    companyName: company.name,
                    companyId: company.id,
                    branchName: branch.name,
                    branchLogo: branch.logo,
                    noOfBranches: employee.length,
                    permissionData: permissionData
                })
            } else {
                return res.status(400).json({ success: false, message: "Bad Method Call" });
            }

        } else {
            return res.status(404).json({ success: false, message: "Invalid branch ID" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" })
    }
}

// Fetching Single Branch
exports.branch_get = async (req, res) => {
    try {
        const DsUser = await DSuser.findOne({ where: { email: req.user } });
        const employee = await Employee.findAll({ where: { email: req.user } });
        if (DsUser) {
            const branch = await Branch.findOne({ where: { id: DsUser.currentBranchId } });
            return res.status(200).json({ success: true, branch: branch });
        } else if (employee) {
            let branches = [];
            employee.forEach(async (emp) => {
                const branch = await Branch.findOne({ where: { id: emp.branchId } });
                branches.push(branch);
            })
            return res.status(200).json({ success: true, branch: branch });
        } else {
            return res.status(400).json({ success: false, message: "Bad Method Call" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "something went wrong, Please try again later" });
    }
}

// Updating Details while switching branch
exports.fetchUserDetails_get = async (req, res) => {
    try {

        if (req.userType === "Employee") {
            const AllEmployees = await Employee.findAll({ where: { email: req.user }, include: [{ model: Flag }] });
            const employee = AllEmployees.find(emp => emp.currentBranchId === emp.branchId);
            let permissionData = await permissionService.getPermissionsByRoleId(employee.roleId);
            //IF permissionData is empty then create new permissionData
            if (permissionData.length === 0) {
                const modules = await Module.findAll();
                await Promise.all(modules.map(async module => {
                    await Permission.create({
                        roleId: employee.roleId,
                        moduleId: module.id,
                        read: false,
                        write: false,
                        delete: false
                    });
                }));
            }
                permissionData = await permissionService.getPermissionsByRoleId(employee.roleId);
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found with matching currentBranchId and branchId' });
            }

            const branch = await Branch.findOne({ where: { id: employee.currentBranchId } });

            if (!branch) {
                return res.status(404).json({ success: false, error: 'Branch not found' });
            }
            const company = await Company.findOne({ where: { id: branch.companyId } });
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
                companyId: company.id
            });

        } else if (req.userType === "DSuser") {
            const dsUser = await DSuser.findOne({
                where: { email: req.user },
                include: [{
                    model: Company, include: [{ model: Branch }]
                }, { model: AdminFlag }]
            });
            const branchName = await Branch.findOne({ where: { id: dsUser.currentBranchId } });
            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({ user: dsUser.email }, key, {
                expiresIn: '30d'
            });
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
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" });
    }
}

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
});


const upload = (bucketName) =>
    multer({
        storage: multerS3({
            s3,
            bucket: bucketName,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, `image-${Date.now()}.jpeg`);
            },
        }),
    });

// Edit Branch 
exports.editBranch_patch = async (req, res) => {
    try {
        const branch = await Branch.findOne({ where: { id: req.params.branchId } });
        const company = await Company.findOne({ where: { id: branch.companyId } });
        if (req.userType === "DSuser") {
            const dsUser = await DSuser.findOne({ where: { email: req.user }, include: [{ model: AdminFlag }, { model: Company }] });
            if (company.dsigmaUserId == dsUser.id) {

                if (!req.body.id || !req.body.code || !req.body.kioskId) {
                    // upload branch logo---------------------
                    const uploadSingle = upload("branchlogo").single(
                        "branchLogo"
                    );
                    uploadSingle(req, res, async (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(400).json({ success: false, message: `Error while uploading the BranchLogo to S3 ERROR:${err.message}` });

                        }
                        await Branch.update({
                            name: req.body.name,
                            description: req.body.description,
                            ABN: req.body.ABN,
                            website: req.body.website,
                            phone: req.body.phone,
                            email: req.body.email,
                            location: req.body.location,
                            address: req.body.address,
                            address2: req.body.address2,
                            city: req.body.city,
                            state: req.body.state,
                            postCode: req.body.postCode,
                            country: req.body.country,
                            facebook: req.body.facebook,
                            instagram: req.body.instagram,
                            linkedIn: req.body.linkedIn,
                            twitter: req.body.twitter,
                            bankName: req.body.bankName,
                            BSB: req.body.BSB,
                            accountNumber: req.body.accountNumber,
                            employee: req.body.employee,
                            logo: req.file ? req.file.location : req.body.logo
                        },
                            { where: { id: req.params.branchId } });
                        const updatedBranch = await Branch.findOne({ where: { id: req.params.branchId } });
                        const key = process.env.ACCESS_TOKEN_SECRET;
                        const accessToken = jwt.sign({ user: dsUser.email }, key, {
                            expiresIn: '30d'
                        });
                        return res.status(200).json({
                            success: true,
                            message: "Branch details updated successfully",
                            user: dsUser.email,
                            isAdmin: dsUser.isAdmin,
                            companyRegistered: dsUser.companyRegistered,
                            currentBranchId: dsUser.currentBranchId,
                            flag: dsUser.adminFlag.flag,
                            JWT_TOKEN: accessToken,
                            companyName: dsUser.company.name,
                            companyId: dsUser.company.id,
                            branchName: updatedBranch ? updatedBranch.name : null,
                            branchLogo: updatedBranch ? updatedBranch.logo : null
                        });

                    });

                } else {
                    return res.status(400).json({ success: false, message: "Bad method call" });
                }


            } else {
                return res.status(401).json({ success: false, message: "Unauthorized user" });
            }


        } else if (req.userType === "Employee") {
            const employee = await Employee.findOne({ where: { email: req.user } });
            const employeeBranch = await Branch.findOne({ where: { id: employee.branchId } });
            if (employeeBranch.companyId === branch.companyId) {
                // cannot edit branch code and id, kioskId
                if (!req.body.id || !req.body.code || !req.body.kioskId) {
                    const uploadSingle = upload("branchlogo").single(
                        "branchLogo"
                    );
                    uploadSingle(req, res, async (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(400).json({ success: false, message: `Error while uploading the BranchLogo to S3 ERROR:${err.message}` });

                        }
                        await Branch.update({
                            name: req.body.name,
                            description: req.body.description,
                            ABN: req.body.ABN,
                            website: req.body.website,
                            phone: req.body.phone,
                            email: req.body.email,
                            location: req.body.location,
                            address: req.body.address,
                            address2: req.body.address2,
                            city: req.body.city,
                            state: req.body.state,
                            postCode: req.body.postCode,
                            country: req.body.country,
                            facebook: req.body.facebook,
                            instagram: req.body.instagram,
                            linkedin: req.body.linkedin,
                            twitter: req.body.twitter,
                            bankName: req.body.bankName,
                            BSB: req.body.BSB,
                            accountNumber: req.body.accountNumber,
                            employee: req.body.employee,
                            logo: req.file ? req.file.location : req.body.logo
                        },
                            { where: { id: req.params.branchId } });
                        const key = process.env.ACCESS_TOKEN_SECRET;
                        const accessToken = jwt.sign({ user: employee.email }, key, {
                            expiresIn: '30d'
                        });
                        const updatedBranch = await Branch.findOne({ where: { id: req.params.branchId } });
                        return res.status(200).json({
                            success: true,
                            message: "Branch details updated successfully",
                            user: employee.email,
                            flag: employee.flag.flag,
                            JWT_TOKEN: accessToken,
                            currentBranchId: employee.currentBranchId,
                            isAdmin: employee.isAdmin,
                            branchId: employee.branchId,
                            employeeId: employee.id,
                            branchName: updatedBranch.name,
                            branchLogo: updatedBranch.logo,
                            companyName: company.name
                        });

                    });
                } else {
                    return res.status(400).json({ success: false, message: "Bad Method Call" });

                }
            } else {
                return res.status(401).json({ success: false, message: "Unauthorized User" })
            }

        } else {
            return res.status(401).json({ success: false, message: "Unauthorized user" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" });
    }
}

