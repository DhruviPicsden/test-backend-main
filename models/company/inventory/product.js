const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const Product = sequelize.define("product", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    // ye delete krna hai
    dealer_id:{
        type: Sequelize.INTEGER,
        allowNull: false,

    },
    carton: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    piece: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
  });
  
  module.exports = Product;