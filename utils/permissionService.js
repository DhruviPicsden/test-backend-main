const Module = require("../models/company/module");
const Permission = require("../models/company/rolesAndPermissions/permission");
const Role = require("../models/company/rolesAndPermissions/role");

async function getPermissionsByRoleId(roleId) {
  try {
    const role = await Role.findByPk(roleId, {
      include: [
        {
          model: Module,
          through: {
            model: Permission,
            where: { roleId: roleId },
            attributes: ['read', 'write', 'delete'],
          },
          attributes: ['name'],
        },
      ],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    let permissionsData = {};

    role.modules.forEach((module) => {
      permissionsData[module.name] = {
        read: module.permission.read,
        write: module.permission.write,
        delete: module.permission.delete,
      };
    });

    return permissionsData;
  } catch (error) {
    throw new Error('Error fetching permissions: ' + error.message);
  }
}

module.exports = {
  getPermissionsByRoleId,
};
