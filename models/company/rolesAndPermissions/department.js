const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

// Single role can have many users
const Department = sequelize.define("department", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    department: {
      type: Sequelize.STRING,
      // unique: true,
      allowNull: false
    },
    description:{
        type: Sequelize.STRING,
        allowNull:true
    }
  });
  
  module.exports = Department;


