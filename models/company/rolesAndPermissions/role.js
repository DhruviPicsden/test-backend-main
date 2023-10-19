const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

// Single role can have many users
const Role = sequelize.define("role", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: Sequelize.STRING,
      // unique: true,
      allowNull: false

    },
    description:{
        type: Sequelize.STRING,
        allowNull:true
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
    }
  });
  
  module.exports = Role;


