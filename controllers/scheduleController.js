const { Op } = require("sequelize");
const ScheduleItem = require("../models/company/branch/ScheduleItem");
const Branch = require("../models/company/branch/branch");
const Employee = require("../models/company/branch/employee/employee");
const EmployeeDetails = require("../models/company/branch/employee/employeeDetails");
const { mailer } = require("../utils/scheduleMailer");
const Flag = require("../models/company/branch/employee/flag");
const moment = require('moment');
const Department = require("../models/company/rolesAndPermissions/department");

const calculateWeekStartDate = (week) => {
    const [year, weekNumber] = week.split('-W').map(str => parseInt(str, 10));
    const firstMonday = moment().isoWeekYear(year).isoWeek(weekNumber).startOf('isoWeek');
    return firstMonday.toDate();
}

const calculateWeekEndDate = (week) => {
    const startDate = calculateWeekStartDate(week);
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    return endDate;
}




const createScheduleItem = async (req, res) => {
    const {
        employeeId,
        branchId,
        date,
        day,
        startTime,
        endTime,
        totalHours,
        unpaidBreak,
        paidBreak,
        notes,
        totalShiftLength,
        published
    } = req.body;

    try {
        // Check time overlap on the same day for the same employee
        
        let scheduleDate = new Date(date);
        const scheduleItems = await ScheduleItem.findAll({
            where: {
                employeeId: employeeId,
                branchId: branchId,
                date: scheduleDate,
                day: day
            }
        });

        console.log('Existing schedule items:', scheduleItems);

        let overlap = false;
        scheduleItems.forEach((item) => {
            if ((startTime >= item.startTime && startTime < item.endTime) || 
                (endTime > item.startTime && endTime <= item.endTime) ||
                (item.startTime >= startTime && item.startTime < endTime) || 
                (item.endTime > startTime && item.endTime <= endTime)) {
                overlap = true;
            }
        });

        if (overlap) {
            return res.status(400).json({ error: "Time overlap" });
        }

        const newScheduleItem = await ScheduleItem.create({
            employeeId,
            branchId,
            date,
            day,
            startTime,
            endTime,
            totalHours,
            unpaidBreak,
            paidBreak,
            notes,
            totalShiftLength,
            published
        });

        // Respond with the created schedule item
        res.status(201).json({ success: true, scheduleItem: newScheduleItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




const getScheduleItems = async (req, res) => {
    const week = req.body.week;
    const branchId = req.currentBranchId;
    const startDate = calculateWeekStartDate(week);
    const endDate = calculateWeekEndDate(week);




    try {
        let scheduleItems = [];
        // Check if schedule data for the week exists, else return an empty array
        const scheduleDataExists = await ScheduleItem.findOne({
            where: {
                branchId: branchId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });


        // Retrieve schedule items if data exists for the week
        scheduleItems = await ScheduleItem.findAll({
            where: {
                branchId: branchId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Employee,
                    include: [
                        {
                            model: EmployeeDetails,
                            attributes: ["fname", "lname"]
                        },
                        {
                            model: Department,
                            attributes: ["department"]
                        },
                        {
                            model: Flag,
                            where: { flag: "Active" }
                        }
                    ],
                    attributes: ["email"]
                }
            ]
        });

        // Format the response to match the desired format

        const formattedScheduleItems = scheduleItems.map(item => ({
            date: item.date,
            day: item.day,
            email: item.employee.email,
            endTime: item.endTime,
            employeeId: item.employeeId,
            id: item.id,
            name: `${item.employee.employeeDetail.fname} ${item.employee.employeeDetail.lname}`,
            notes: item.notes,
            published: item.published,
            scheduleId: item.shiftId, // Change shiftId to scheduleId
            startTime: item.startTime,
            totalHours: item.totalHours,
            totalShiftLength: item.totalShiftLength,
            unpaidBreak: item.unpaidBreak

        }));
        //make department wise summary include emplyee name and total hours


        //saort schedule items by time
        formattedScheduleItems.sort((a, b) => {
            if (a.startTime < b.startTime) { return -1; }
            if (a.startTime > b.startTime) { return 1; }
            return 0;
        });
        //add total published shifts and total unpublished shifts
        let totalPublishedShifts = 0;
        let totalUnpublishedShifts = 0;
        scheduleItems.forEach((item) => {
            if (item.published) {
                totalPublishedShifts++;
            } else {
                totalUnpublishedShifts++;
            }
        });

        //department wise shcedule items

        let departmentWiseScheduleItems = [];
        //make department wise schedule items like {department: 'chef', scheduleItems: [{},{}]}
        scheduleItems.forEach((item) => {
            let found = false;
            departmentWiseScheduleItems.forEach((departmentWiseScheduleItem) => {
                if (departmentWiseScheduleItem.department == item.employee.department.department) {
                    departmentWiseScheduleItem.scheduleItems.push(item);
                    found = true;
                }
            });
            if (!found) {
                departmentWiseScheduleItems.push({ department: item.employee.department.department, scheduleItems: [item] });
            }
        });

        //sort department wise schedule items by department
        departmentWiseScheduleItems.sort((a, b) => {
            if (a.department < b.department) { return -1; }
            if (a.department > b.department) { return 1; }
            return 0;
        });

        let summary = [];
        //make summary
        //dept wise employee and total hours like {department: 'chef', employees: [{name: 'abc', totalHours: 10}, {name: 'xyz', totalHours: 20}]}
        departmentWiseScheduleItems.forEach((departmentWiseScheduleItem) => {
            let employees = [];
            departmentWiseScheduleItem.scheduleItems.forEach((item) => {
                let found = false;
                employees.forEach((employee) => {
                    if (employee.name == `${item.employee.employeeDetail.fname} ${item.employee.employeeDetail.lname}`) {
                        // employee.totalHours += item.totalHours;
                        // found = true;
                        //timw is like "03h 30m"
                        let hours = parseInt(item.totalHours.split("h")[0]);
                        let minutes = parseInt(item.totalHours.split("h")[1].split("m")[0]);
                        //get existing hours and minutes
                        let existingHours = parseInt(employee.totalHours.split("h")[0]);
                        let existingMinutes = parseInt(employee.totalHours.split("h")[1].split("m")[0]);
                        //add hours and minutes
                        let newHours = hours + existingHours;
                        let newMinutes = minutes + existingMinutes;
                        //if minutes exceed 60 then add 1 to hours and subtract 60 from minutes
                        if (newMinutes >= 60) {
                            newHours = newMinutes / 60;
                            newMinutes = newMinutes % 60;
                        }
                        employee.totalHours = `${newHours}h ${newMinutes}m`;
                        found = true;
                    }
                });
                if (!found) {
                    employees.push({ name: `${item.employee.employeeDetail.fname} ${item.employee.employeeDetail.lname}`, totalHours: item.totalHours });
                }
            });
            summary.push({ department: departmentWiseScheduleItem.department, employees: employees });
        });



        res.json({ scheduleItems: departmentWiseScheduleItems, totalPublishedShifts: totalPublishedShifts, totalUnpublishedShifts: totalUnpublishedShifts, summary: summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateScheduleItem = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const updatedScheduleItem = req.body; // Updated schedule item data

        await ScheduleItem.update(updatedScheduleItem, { where: { id: scheduleId } });

        res.status(200).json({ message: "Schedule item updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteScheduleItem = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        await ScheduleItem.destroy({ where: { id: scheduleId } });

        res.status(200).json({ message: "Schedule item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEmployeeSchedules = async (req, res) => {
    try {
        const { empId } = req.params;

        const employeeSchedules = await ScheduleItem.findAll({
            where: { employeeId: empId, branchId: req.currentBranchId, published: true },
        });

        if (!employeeSchedules) {
            return res.status(404).json({ message: "No schedules found" });
        }

        res.status(200).json({ employeeSchedules });
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
};

//week to start date






const publishShiftsForWeek = async (req, res) => {
    try {
        const week = req.body.week;
        const companyName = req.body.companyName;
        const type = req.body.type;
        const notify = req.body.notify;
        const branchId = req.currentBranchId;


        const startDate = calculateWeekStartDate(week);
        const endDate = calculateWeekEndDate(week);
        let scheduleItems = [];
        //there are 2 types , unpublished and all, if unpublished then only publish unpublished shifts for the week
        //match branchid and week and make published true for all shifts
        if (type == "unpublished") {
            scheduleItems = await ScheduleItem.findAll({
                where: {
                    branchId: branchId,
                    published: false,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [{ model: Employee, attributes: ["email"], include: [{ model: EmployeeDetails, attributes: ["fname", "lname"] }] }]
            });
            //update to true
            scheduleItems.forEach(async (item) => {
                await ScheduleItem.update({ published: true }, { where: { id: item.id } });
            });
        }
        else if (type == "all") {
            scheduleItems = await ScheduleItem.findAll({
                where: {
                    branchId: branchId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [{ model: Employee, attributes: ["email"], include: [{ model: EmployeeDetails, attributes: ["fname", "lname"] }] }]
            });
            //update to true
            scheduleItems.forEach(async (item) => {
                await ScheduleItem.update({ published: true }, { where: { id: item.id } });
            });
        } else {
            res.status(500).json({ error: "Invalid type" });
        }

        const branch = await Branch.findOne({
            where: { id: branchId },
            attributes: ["name"]
        });
        const branchName = branch.name;
        if (notify) {
            // const emailPromises = scheduleItems.map(async (item) => {
            //     const email = item.employee.email;
            //     const name = `${item.employee.employeeDetail.fname} ${item.employee.employeeDetail.lname}`;
            //     const shiftTable = [item];
            //     const weekString = week;
            //     return mailer(email, name, shiftTable, weekString, branchName, companyName);
            // }
            // );
            // await Promise.all(emailPromises);
            //make employee wise shift table
            let employeeShiftTable = [];
            scheduleItems.forEach((item) => {
                let found = false;
                employeeShiftTable.forEach((shiftTable) => {
                    if (shiftTable.email == item.employee.email) {
                        shiftTable.shiftTable.push(item);
                        found = true;
                    }
                });
                if (!found) {
                    employeeShiftTable.push({ email: item.employee.email, shiftTable: [item] });
                }
            });
            //send emails
            const emailPromises = employeeShiftTable.map(async (item) => {
                const email = item.email;
                const name = `${item.shiftTable[0].employee.employeeDetail.fname} ${item.shiftTable[0].employee.employeeDetail.lname}`;
                const shiftTable = item.shiftTable;
                const weekString = week;
                return mailer(email, name, shiftTable, weekString, branchName, companyName);
            }
            );
            res.status(200).json({ message: "Shifts published successfully and emails sent" });
        } else {
            res.status(200).json({ message: "Shifts published successfully" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const employeesForSchedule_get = async (req, res) => {
    try {
        const branchId = req.currentBranchId;
        const employees = await Employee.findAll({
            where: { branchId: branchId },
            attributes: ["id"],
            include: [{ model: EmployeeDetails, attributes: ["fname", "lname"] },
            { model: Flag, where: { flag: "Active" } },
            { model: Department, attributes: ["department"] }
            ]
        });
        employees.sort((a, b) => {
            if (a.employeeDetail.fname < b.employeeDetail.fname) { return -1; }
            if (a.employeeDetail.fname > b.employeeDetail.fname) { return 1; }
            return 0;
        });
        //remove employees where fname || lname || department == null
        let cleanEmployees = [];
        employees.forEach((employee) => {
            if (employee.employeeDetail.fname != null && employee.employeeDetail.lname != null && employee.department.department != null) {
                cleanEmployees.push(employee);
            }
        });


        res.status(200).json({ employees: cleanEmployees });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const copyAndPasteScheduleItems = async ({ fromWeek, toWeek }) => {
    try {
        const fromWeekStartDate = calculateWeekStartDate(fromWeek);
        const fromWeekEndDate = calculateWeekEndDate(fromWeek);

        const toWeekStartDate = calculateWeekStartDate(toWeek);

        // Fetch all schedule items from the 'fromWeek'
        const scheduleItemsToCopy = await ScheduleItem.findAll({
            where: {
                date: {
                    [Op.between]: [fromWeekStartDate, fromWeekEndDate]
                }
            }
        });

        // Modify schedule items for the 'toWeek'
        const modifiedScheduleItems = scheduleItemsToCopy.map(item => ({
            ...item.dataValues,
            date: new Date(item.date.getTime() + (toWeekStartDate - fromWeekStartDate)), // Adjust the date to the 'toWeek'
            //if published = true then make it false
            published: false // Set 'published' to false for copied shifts
        }));

        //remove id
        modifiedScheduleItems.forEach((item) => {
            delete item.id;
        });

        // Insert the modified schedule items for the 'toWeek'
        await ScheduleItem.bulkCreate(modifiedScheduleItems);

        return { success: true, message: 'Schedule items copied and pasted successfully.' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};


const copySchedule = async (req, res) => {

    const { fromWeek, toWeek } = req.body;

    const result = await copyAndPasteScheduleItems({ fromWeek, toWeek });

    if (result.success) {
        res.status(200).json({ success: true, message: result.message });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }


}


const deleteShiftsForWeek = async (req, res) => {

    const week = req.body.week;
    const branchId = req.currentBranchId;
    const startDate = calculateWeekStartDate(week);
    const endDate = calculateWeekEndDate(week);

    try {
        await ScheduleItem.destroy({
            where: {
                branchId: branchId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        res.status(200).json({ success: true, message: 'Shifts deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}



module.exports = {
    createScheduleItem,
    getScheduleItems,
    updateScheduleItem,
    deleteScheduleItem,
    getEmployeeSchedules,
    publishShiftsForWeek,
    employeesForSchedule_get,
    copySchedule,
    deleteShiftsForWeek
};
