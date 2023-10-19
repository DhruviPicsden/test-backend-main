const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const Order = sequelize.define("order", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    delivered: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    // prodsId:{
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   get() {
    //       return this.getDataValue('prodsId').split(',')
    //   },
    //   set(val) {
    //     this.setDataValue('prodsId',val.join(','));
    //   },
    // }

    prodsId:{
      type: Sequelize.JSON,
      allowNull: false
    }
  });
  
  module.exports = Order;