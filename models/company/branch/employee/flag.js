const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const Flag = sequelize.define("flag", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      flag: {
        type: Sequelize.STRING,
      },
      user_id:{
          type: Sequelize.INTEGER
      }
    });
  
  module.exports = Flag;


