const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const ShiftTimeline = sequelize.define("shiftTimeline", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      userId:{
          type: Sequelize.INTEGER,
          allowNull: true
      },
      shiftId:{
        type: Sequelize.INTEGER,
        allowNull: true
      },
      message:{
        type: Sequelize.STRING,
        allowNull: false
      },
      dsUserId:{
        type: Sequelize.INTEGER,
        allowNull: true
      }
      
    });
  
  module.exports = ShiftTimeline;


