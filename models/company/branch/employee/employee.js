const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");


const Employee = sequelize.define("employee", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      isEmail: true,
    },
    password: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    pin: {
      type: Sequelize.INTEGER,
      // This has to be false
      allowNull: false,
    },
    roleId:{
      type: Sequelize.INTEGER,
      allowNull: true
    },

    deptId:{
      type: Sequelize.INTEGER,
      allowNull: true
    },

    shiftStatus:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Working', 'Not Working', 'On Break']],
          msg: 'Please select appropriate option'
        }
      },
      defaultValue:"Not Working",
      allowNull: false,
    },
    // isBranchManager:{
    //   type: Sequelize.BOOLEAN,
    //   DefaultValue: false
    // }
    isAdmin:{
      type:Sequelize.BOOLEAN,
      allowNull:false,
      defaultValue:false
    },
    currentBranchId:{
      type: Sequelize.INTEGER,
      allowNull:false
    }
  });
  module.exports = Employee;


