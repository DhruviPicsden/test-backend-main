const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");


const ScheduleItem = sequelize.define('scheduleItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    employeeId: {
       type: Sequelize.INTEGER,
         allowNull: false
    },
    branchId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    day: {
        type: Sequelize.STRING,
        allowNull: false
    },
    startTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    endTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    totalHours: {
        type: Sequelize.STRING,
        allowNull: false
    },
    unpaidBreak: {
        type: Sequelize.STRING,
        allowNull: false
    },
    paidBreak: {
        type: Sequelize.STRING,
        allowNull: false
    },
    notes: {
        type: Sequelize.STRING
    },
    totalShiftLength: {
        type: Sequelize.STRING,
        allowNull: false
    },
    published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = ScheduleItem;
