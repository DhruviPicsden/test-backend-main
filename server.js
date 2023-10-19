const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const cors = require('cors');


// Database Connection 
const DB = require('./models/index');

// require('./test');

// Middleware's
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());


// Routes
const userRoutes = require('./routes/dsigmaUser');
const companyRoutes = require('./routes/company');
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branch');
const emailRoutes = require('./routes/email');
const employeeRoutes = require('./routes/employee');
const kioskRoutes = require('./routes/kiosk');
// const testRoute = require('./routes/test');
const shiftRoutes = require('./routes/shift');
const roleRoutes = require('./routes/role');
const departmentRoutes = require('./routes/department');
const scheduleRoutes = require('./routes/schedule');


// Routes Middleware
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api', authRoutes);
app.use('/api', branchRoutes);
app.use('/api', emailRoutes);
app.use('/api', employeeRoutes);
app.use('/api', roleRoutes);
app.use('/api/kiosk', kioskRoutes);
// app.use('/api/test', testRoute);
app.use('/api/', shiftRoutes);
app.use('/api/', departmentRoutes);
app.use('/api/', scheduleRoutes);




// Server Init
app.listen(PORT, ()=>{
    console.log(`Listening to Port: ${PORT}`);
});