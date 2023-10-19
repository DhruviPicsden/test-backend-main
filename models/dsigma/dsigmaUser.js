const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const DsigmaUser = sequelize.define("dsigmaUser", {
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
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    companyRegistered:{
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    firstName:{
      type: Sequelize.STRING,
      allowNull: true
    },
    lastName:{
      type: Sequelize.STRING,
      allowNull: true
    },
    currentBranchId:{
      type: Sequelize.INTEGER,
      allowNull: true
    },
    mobileNumber:{
      type: Sequelize.STRING,
      allowNull: true
    },
    DOB:{
      type: Sequelize.DATE,
      allowNull: true,
      default: null
    },
    gender:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Male', 'Female', 'Not Stated']],
          msg: 'Please select appropriate option'
        }
      },
      default: "N/A"
    }

  });
  
  module.exports = DsigmaUser;


