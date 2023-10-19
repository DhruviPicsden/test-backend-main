const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Note = sequelize.define("note", {
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
    description: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type:{
        type: Sequelize.STRING,
        validate:{
          isIn:{
            args:[['Bonuses', 'General', 'Incentives', 'Qualification']],
            msg: 'Please select appropriate option'
          }
        },
    },
    createdBy:{
        type: Sequelize.INTEGER,
        allowNull: false, 
        
    }
    
  });
  
  module.exports = Note;


note