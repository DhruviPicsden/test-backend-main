const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const EmployeeDetails = sequelize.define("employeeDetails", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId:{
      type: Sequelize.INTEGER,
      allowNull: true,

    },
    
// INFO
    title: {
      type: Sequelize.STRING,
      default: "N/A"
    },
    // Required
    fname: {
      type: Sequelize.STRING,
      // allowNull: false,
      default: "N/A"
    },
    // Required
    lname: {
      type: Sequelize.STRING,
      // allowNull: false,
      default: "N/A"

    },
    workEmail: {
      type: Sequelize.STRING,
      allowNull: false,
      isEmail: true,
    },
    personalEmail:{
      type: Sequelize.STRING,
      isEmail: true,
      default: "N/A"
    },
    mobNumber:{
      type: Sequelize.STRING,
      default: "N/A"

    },

// PERSONAL INFORMATION
    DOB:{
      type: Sequelize.DATE,
      allowNull: true,
      default: null
    },

    maritalStatus:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Single', 'Married', 'Divorced', 'Defacto']],
          msg: 'Please select appropriate option'
        }
      },
      default: "N/A"
    },

    gender:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Male', 'Female', 'Not Stated']],
          msg: 'Please select appropriate option'
        }
      },
      default: "N/A"
    },

    medicareNumber:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    driversLicence:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    passportNumber:{
      type: Sequelize.STRING,
      default: "N/A"
    },

// ADDRESS DETAILS
    address:{
    type: Sequelize.STRING,
    default: "N/A"
    },

    address2:{
    type: Sequelize.STRING,
    default: "N/A"
    },

    city:{
    type: Sequelize.STRING,
    default: "N/A"
    },

    state:{
    type: Sequelize.STRING,
    default: "N/A"
    },

    postCode:{
    type: Sequelize.STRING,
    default: "N/A"
    },

    country:{
      type: Sequelize.STRING,
      default: "N/A"
    },

// BANK DETAILS
    bankName:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    BSB:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    accountNumber:{
      type: Sequelize.STRING,
      default: "N/A"
    },

// TAX INFO
    taxFileNumber:{
      type: Sequelize.STRING,
      default: "N/A"
    },

// WORKING RIGHTS
    workingRights:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Australian Citizen', 'Holiday Visa', 'Partner Visa', 'Permanent Resident', 'Sponsored', 'Student Visa', 'Visa 408', 'Visa 485']],
          msg: 'Please select appropriate option'
        }
      },
      default: "N/A"
    },

// PRIMARY CONTACT {REQUIRED}
    firstName:{
      type: Sequelize.STRING,
      default: "N/A"
      // allowNull: false,
    },
    
    lastName:{
      type: Sequelize.STRING,
      default: "N/A"
      // allowNull: false,
    },

    email:{
      type: Sequelize.STRING,
      isEmail: true,
      default: "N/A"
      // allowNull: false,
    },

    mobile:{
      type: Sequelize.STRING,
      default: "N/A"
      // allowNull: false,
    },

    workPhone:{
      type: Sequelize.STRING,
      // allowNull: false,
    },

    contactType:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Family', 'Friend', 'Partner']],
          msg: 'Please select appropriate option'
        }
      },
      // allowNull: false,
    },

// SECONDARY CONTACT

    sfname:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    slname:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    semail:{
      type: Sequelize.STRING,
      isEmail: true,
      default: "N/A"
    },

    smobNo:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    sworkNo:{
      type: Sequelize.STRING,
      default: "N/A"
    },

    scontactType:{
      type: Sequelize.STRING,
      default: "N/A"
    },
  // Social
    linkedIn: {
      type: Sequelize.STRING,
      default: "N/A"
    },
    file1:{
      type: Sequelize.STRING,
      default: "N/A"
    },
    file2:{
      type: Sequelize.STRING,
      default: "N/A"
    },
    file3:{
      type: Sequelize.STRING,
      default: "N/A"
    }

  });
  
  module.exports = EmployeeDetails;