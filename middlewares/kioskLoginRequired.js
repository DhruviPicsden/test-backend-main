require('dotenv').config();
const jwt = require('jsonwebtoken')
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET
const Branch = require("../models/company/branch/branch");


module.exports = (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ message: "You must be logged in" })
        }
        const token = authorization.replace("Bearer ", "")
        jwt.verify(token, JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({ message: "You must be logged in" })
            }
            const { branchId } = payload
            Branch.findOne({where:{id:branchId}}).then(userData => {
                req.branchId = userData.id;
                next()
            }).catch((err) => {
                console.log(err)
                return res.status(404).json({success: false, message: `KioskLoginRequired, Inappropriate JWT`});
            })
        })
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({success:false, message:`KioskLoginRequired, Something Went Wrong`});
    }
}