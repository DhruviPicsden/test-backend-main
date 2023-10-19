const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const AdminFlag = sequelize.define("adminFlag", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
   flag:{
    type: Sequelize.STRING,
    allowNull: false,
    validate:{
        isIn:{
          args:[['Signed Up', 'Company Registered']],
          msg: 'Please select appropriate option'
        }
      },
   }
  });
  
  module.exports = AdminFlag;


