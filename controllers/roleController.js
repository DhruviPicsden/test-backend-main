const Role = require('../models/company/rolesAndPermissions/role');
const Employee = require('../models/company/branch/employee/employee');
const Permission = require('../models/company/rolesAndPermissions/permission');
const Module = require('../models/company/module');

exports.createRole_post = async (req, res) => {
    try {
        const role = await Role.create({
            role: req.body.role,
            description: req.body.description,
            branchId: req.currentBranchId,
        });

        const permissions = req.body.permissions;

        if (permissions && permissions.length > 0) {
            await Promise.all(permissions.map(async (perm) => {
                const module = await Module.findOne({ where: { id: perm.moduleId } });
                if (!module) {
                    return res.status(400).json({ success: false, message: "Invalid moduleId" });
                }

                await Permission.create({
                    roleId: role.id,
                    moduleId: perm.moduleId,
                    read: perm.read,
                    write: perm.write,
                    delete: perm.delete
                });
            }));
        } else {
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
        }

        res.status(200).json({ success: true, message: "Role created successfully" });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getRoles_get = async (req, res) => {
    try {
        const roles = await Role.findAll({
            where: { branchId: req.params.branchId }
        });
        const rolesWithPermissions = [];
        for (let i = 0; i < roles.length; i++) {
            let obj = {};
            obj.role = roles[i].role;
            obj.description = roles[i].description;
            obj.id = roles[i].id;
            obj.permissions = [];
            const permissions = await Permission.findAll({
                where: { roleId: roles[i].id }
            });
            for (let j = 0; j < permissions.length; j++) {
                let moduleItem = await Module.findOne({
                    where: { id: permissions[j].moduleId }
                });
                let permission = {};
                permission.moduleId = permissions[j].moduleId;
                permission.module = moduleItem.name;
                permission.read = permissions[j].read;
                permission.write = permissions[j].write;
                permission.delete = permissions[j].delete;
                obj.permissions.push(permission);
            }
            rolesWithPermissions.push(obj);
        }
        res.send(rolesWithPermissions);
    } catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}



exports.getRole_get = async (req, res) => {
    // const role = await Role.findOne({
    //     where: {id: req.params.id}
    // });
    // res.send(role);
    try {
        const employee = await Employee.findOne({
            where: { id: req.params.empId }
        });
        const role = await Role.findOne({
            where: { id: employee.roleId }
        });

        res.send(role);
    } catch (err) {
        res.send(err);
    }

}

exports.updateRole_put = async (req, res) => {
    try {
        let roleItem = await Role.findOne({
            where: { id: req.params.id }
        });

        if (roleItem && roleItem.role === 'Basic') {
            return res.status(400).json({ success: false, message: "Basic role cannot be updated" });
        }

        await Role.update({
            role: req.body.role,
            description: req.body.description,
        }, {
            where: { id: req.params.id }
        });
        //if role is basic then update all employees with same branchId
        const role = await Role.findOne({ where: { id: req.params.id } });
        // Update associated permissions
        const permissions = req.body.permissions; // Assuming permissions is an array of objects with moduleId and permissions
        if (permissions && permissions.length > 0) {
            await Promise.all(permissions.map(async (perm) => {
                await Permission.update({
                    read: perm.read,
                    write: perm.write,
                    delete: perm.delete
                }, {
                    where: { roleId: req.params.id, moduleId: perm.moduleId }
                });
            }));
        }

        res.status(200).json({ success: true, message: "Role updated successfully" });
    } catch (err) {
        res.send(err);
    }
}

exports.deleteRole_delete = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            where: { roleId: req.params.id }
        });

        const role = await Role.findOne({
            where: { id: req.params.id }
        });
        if (role.role === 'Basic') {
            res.status(400).json({ success: false, message: "Basic role cannot be deleted" });
        } else if (employees.length === 0) {
            await Permission.destroy({
                where: { roleId: req.params.id }
            });
            await Role.destroy({
                where: { id: req.params.id }
            });
            //delete all permissions of role

            res.status(200).json({ success: true, message: "Role deleted successfully" });
        } else if (employees.length > 0) {
            //force delte link call eg. /role/deleteRole/1?forceDelete=true
            if (req.query.forceDelete === 'true') {
                //find role with name 'Basic' and haveing same branchId
                const basicRole = await Role.findOne({
                    where: { role: 'Basic', branchId: role.branchId }
                });
                //assign basic role to all employees to whom role is assigned
                employees.forEach(async employee => {
                    await Employee.update({ roleId: basicRole.id }, { where: { id: employee.id } });
                });
                await Permission.destroy({
                    where: {roleId: req.params.id}
                });
                await Role.destroy({
                    where: { id: req.params.id }
                });

                res.status(200).json({ success: true, message: "Role deleted successfully and basic role is assigned" });
            } else {
                //send mailids of employees to whom role is assigned
                let mailIds = [];
                employees.forEach(employee => {
                    mailIds.push(employee.dataValues.email);
                }
                );
                res.status(400).json({ success: false, message: "Role is assigned to employees", mailIds: mailIds });
            }
        }
    } catch (err) {
        res.send(err);
    }
}



exports.getRoleByEmployee_get = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            where: { id: req.params.id }
        });
        const role = await Role.findOne({
            where: { id: employee.roleId }
        });
        res.send(role);
    } catch (err) {
        res.send(err);
    }
}

exports.assignRole_post = async (req, res) => {
    try {
        // fetching the employee
        const role = await Role.findOne({ where: { id: req.body.roleId } });
        const employee = await Employee.findOne({ where: { id: req.params.empId } });
        //update Emoloyee.roleId
        if (employee && role) {
            await Employee.update({ roleId: req.body.roleId }, { where: { id: req.params.empId } });
            return res.status(200).json({ success: true, message: `${role.role} role has been assigned to ${employee.email}` });
        } else {
            return res.status(404).json({ success: false, message: "Employee or role not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" });
    }

}


exports.getModules_get = async (req, res) => {
    try {
        const modules = await Module.findAll();
        res.send(modules);
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

