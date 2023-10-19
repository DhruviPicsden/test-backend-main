const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const ProdCart = sequelize.define("prodCart", {
    // id: {
    //   type: Sequelize.INTEGER,
    //   autoIncrement: true,
    //   allowNull: false,
    //   primaryKey: true,
    // },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    // this has to be unique in the set of a single user
    productId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
      type: Sequelize.STRING,
      required: true
    },

  });
  
  module.exports = ProdCart;