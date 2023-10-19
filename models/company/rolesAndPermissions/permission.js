const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

const Permission = sequelize.define("permission", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

read:{
  type: Sequelize.BOOLEAN,
  defaultValue:false
},
write:{
  type: Sequelize.BOOLEAN,
  defaultValue:false
},
delete:{
  type: Sequelize.BOOLEAN,
  defaultValue:false
},
roleId:{
  type: Sequelize.INTEGER,
  allowNull:false
},
moduleId:{
  type: Sequelize.INTEGER,
}
  });
  
  module.exports = Permission;


