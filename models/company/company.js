const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const Company = sequelize.define("company", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    // This has to be unique
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description:{
        type: Sequelize.STRING,
        allowNull:true
    },
    code:{
      type: Sequelize.STRING,
      allowNull:false
    }
    
    // generalManager:{
    //   type: Sequelize.INTEGER,
    //   allowNull:true
    // }
    
  });
  
  module.exports = Company;


