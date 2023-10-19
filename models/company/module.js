const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const Module = sequelize.define("modules", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    } 
});
  
  module.exports = Module;


