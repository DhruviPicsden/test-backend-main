const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const OTP = sequelize.define("otp", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    otp: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    dsUser:{
        type: Sequelize.BOOLEAN,
        allowNull:true
    },
    used:{
        type: Sequelize.BOOLEAN,
        defaultValue:false,
        allowNull:false
    },
    userId:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
    
  });
  
  module.exports = OTP;


