const { Op } = require("sequelize");
const ScheduleItem = require("../models/company/branch/ScheduleItem");

const calculateWeekStartDate = (week) => {
    const [year, weekNumber] = week.split('-W').map(str => parseInt(str, 10));
    const januaryFirst = new Date(year, 0, 1);
    const firstMonday = new Date(januaryFirst.getTime());
    firstMonday.setDate(januaryFirst.getDate() + (1 - januaryFirst.getDay() + 7) % 7);
    const startDate = new Date(firstMonday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + 1); // Add 1 day
    return startDate;
}

const calculateWeekEndDate = (week) => {
    const startDate = calculateWeekStartDate(week);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 + 1); // Seven days later (to reach Sunday) + 1 more day
    return endDate;
}


module.exports.copyAndPasteScheduleItems = async (fromWeek, toWeek) => {
    try {
        const fromWeekStartDate = calculateWeekStartDate(fromWeek);
        const fromWeekEndDate = calculateWeekEndDate(fromWeek);
        
        const toWeekStartDate = calculateWeekStartDate(toWeek);
        const toWeekEndDate = calculateWeekEndDate(toWeek);

        // Fetch schedule items from the 'fromWeek'
        const scheduleItemsToCopy = await ScheduleItem.findAll({
            where: {
                date: {
                    [Op.between]: [fromWeekStartDate, fromWeekEndDate]
                },
                published: true // Consider only published shifts
            }
        });

        // Modify schedule items for the 'toWeek'
        const modifiedScheduleItems = scheduleItemsToCopy.map(item => ({
            ...item.dataValues,
            date: new Date(item.date.getTime() + (toWeekStartDate - fromWeekStartDate)), // Adjust the date to the 'toWeek'
            published: false // Set 'published' to false for copied shifts
        }));

        // Insert the modified schedule items for the 'toWeek'
        await ScheduleItem.bulkCreate(modifiedScheduleItems);

        return { success: true, message: 'Schedule items copied and pasted successfully.' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};


