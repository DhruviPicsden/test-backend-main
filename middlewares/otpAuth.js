require('dotenv').config();
const jwt = require('jsonwebtoken')
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET
const Employee = require("../models/company/branch/employee/employee");


module.exports = (req, res, next) => {
    try {
        const { authorization } = req.headers
        // console.log(`AUTHORIZATION: ${authorization}`)
        if (!authorization) {
            return res.status(401).json({ message: "Invalid request" })
        }
        const token = authorization.replace("Bearer ", "")
        // console.log(`TOKEN: ${token}`)
        jwt.verify(token, JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({ message: "Please try again your OTP has expired" });
            }
            const { user } = payload;
            req.user = user;
            req.payload = payload;
            next()
            
        })
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({success:false, message:`Something Went Wrong, please try again`});
    }
}