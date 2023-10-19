
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3-v2' );
const multer = require('multer');
const path = require( 'path' );
const EmployeeRole = require('../models/company/rolesAndPermissions/employeeRole');
const Role = require('../models/company/rolesAndPermissions/role');
const Employee  = require('../models/company/branch/employee/employee');
const permissions = require('../models/company/rolesAndPermissions/permission');
// const { Module } = require('module');
const Modules = require('../models/company/module');

exports.testRoute = async(req,res)=>{	
	
	  const emp = await Employee.findOne({where:{id:6}, include:[{model:EmployeeRole}]});
	  const role = await Role.findOne({where:{id:emp.employeeRole.roleId}});
	  const permission = await permissions.findAll({where:{roleId:role.id}});
	//   const modules = await Modules.findAll 
	  console.log(emp)
	  return res.json({d:emp, role:role})
	
}

console.log(process.env.S3_ACCESS_KEY)
const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    Bucket: 'dsigma-employee-files'
});


function checkFileType( file, cb ){
	// Allowed ext
	const filetypes = /pdf|doc|docx|txt|rtf|jpg|png/;
	// Check ext
	const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
	// Check mime
	const mimetype = filetypes.test( file.mimetype );
	if( mimetype && extname ){
		return cb( null, true );
	} else {
		cb( 'Error: pdf,doc,docx,txt,rtf,jpg,png Only!' );
	}
}

const uploadsBusinessGallery = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'dsigma-employee-files',
		// acl: 'public-read',
		key: function (req, file, cb) {
			cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		}
	}),
	limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
	fileFilter: function( req, file, cb ){
		checkFileType( file, cb );
	}
}).array( 'galleryImage', 3 );

exports.testRoutes = (req,res)=>{
	console.log(req)
    return res.send("kakashi")
    
}

exports.testingRoutes = (req,res)=>{
	console.log(req.files.branchLogo[0].location);
	return res.send("kakashi")
}
