const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const loginHistory = sequelize.define("loginHistory", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: Sequelize.STRING,
    },
    employeeId: {
        type: Sequelize.INTEGER
    },

    branchId: {
        type: Sequelize.INTEGER
    },
    loginTime: {
        type: Sequelize.DATE
    },
    changedDefaultPassword: {
        type: Sequelize.BOOLEAN
    },
    
});

module.exports = loginHistory;


