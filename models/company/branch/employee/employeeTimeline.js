const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const EmployeeTimeline = sequelize.define("userTimeline", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    employeeId:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message:{
      type: Sequelize.STRING,
      allowNull: false
    },
    device:{
        type: Sequelize.STRING,
        allowNull: true, 
        defaultValue: "N/A"
    },
    updatedBy:{
        type: Sequelize.INTEGER,
        allowNull: false, 
        
    }
    
  });
  
  module.exports = EmployeeTimeline;


