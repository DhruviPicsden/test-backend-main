const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const Dealer = sequelize.define("dealer", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    }
  });
  
  module.exports = Dealer;
