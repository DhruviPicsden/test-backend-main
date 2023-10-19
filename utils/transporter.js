const nodemailer = require("nodemailer");
require('dotenv').config();

// const transporter = nodemailer.createTransport({
//  host: 'smtp.zoho.in', 
//  port: 465,
//  secure: true, // use SSL
//   debug: true,
//   auth: {
//     user: 'noreply@dsigma.com.au',
//     pass: 'DSigma@2023',
//   },
// });


// const transporter = nodemailer.createTransport({
//   //   host: "smtp.gmail.com",
//   service: "gmail",
//   port: 587,
//   auth: {
//     user: "noreply.dsigma@gmail.com",
//     pass: "cjey covh fsuy haoz",
//   },
// });


const transporter = nodemailer.createTransport({
 host: "email-smtp.ap-south-1.amazonaws.com",
  port: 587,
  auth: {
    user: 'AKIA2L3COOSF4BGM4RTO',
    pass: 'BBHIEvTgXt5cPBIxumSs+3s9pI1bg177tS8rCoU45UWL',
  },
});

exports.transporter =  transporter;
