const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

// Single role can have many users
const TryPrem = sequelize.define("tryPrem", {
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
    }
  });
  
  module.exports = TryPrem;


