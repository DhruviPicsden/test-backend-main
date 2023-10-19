const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

const Branch = sequelize.define("branch", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    // Company Information
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description:{
        type: Sequelize.STRING,
        allowNull:true
    },
    // This is Unique
    code:{
      type:Sequelize.INTEGER,
      allowNull:false,
      unique: true
    },
    // This has to be unique 
    kioskId:{
      type:Sequelize.STRING,
      allowNull:false,
      unique:true
    },
    ABN:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true

    },
    website:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    phone:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    email:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    location:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    // Primary Address
    address:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    address2:{
    type:Sequelize.STRING,
    defaultValue:"N/A",
    allowNull:true  
    },
    city:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    state:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    postCode:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    country:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    // Social Information
    facebook:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    instagram:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    linkedIn:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },
    twitter:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    // Bank Details
    bankName:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    BSB:{
      type: Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    accountNumber:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    // Primary Contact

    employee:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    },

    logo:{
      type:Sequelize.STRING,
      defaultValue:"N/A",
      allowNull:true
    }
    
    
  });
  
  module.exports = Branch;


