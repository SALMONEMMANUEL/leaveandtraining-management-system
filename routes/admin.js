var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
const adminController = require('../config/staffs');
var csrf = require('csurf');
var csrfProtection = csrf();
const staffController = require('../config/staffs');
var config_passport = require('../config/passport.js');
var moment = require('moment');
var Leave = require('../models/leave');
let modeLeave = require('../models/leavee');
const leave = require('../models/leave');
const user = require('../models/user');
const { count, populate } = require('../models/user');
const Request = require('../models/training/upload');
const Department = require('../models/department')
var Trequest = require('../models/training/request');

let path = require("path")
let fs = require("fs")
let json2xls = require("json2xls");
const { Router } = require('express');
const { type } = require('os');

router.use('/', isLoggedIn, function isAuthenticated(req, res, next) {
    next();
});


//   Displays home page to the admin


router.get('/', function viewHome(req, res, next) {
    res.render('Admin/adminHome', {
        title: 'Admin Home',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});










//display the admin dashboard for laeve

router.get('/dashboard', async function dashboard(req, res, next){

    const dataone = Leave.find({}).populate("applicantID")

    let countObj = {}

    const countArray = [
        Leave.count({ adminResponse : "Pending" }, (error, result) => { countObj["pending"] = result }),
        Leave.count({ adminResponse : "Approved" }, (error, result) =>  { countObj["approved"] = result }),  
        Leave.count({ adminResponse : "Disapproved" }, (error, result) => {   countObj["disapproved"] = result })
    ]

    dataone.exec((error, docone) => {

        if(error)console.log(error)
        else{

            let dep = ["All"] // department
            let target_data = []

            for(let a = 0; a < docone.length; a++){

                let { type, period, adminResponse, appliedDate } = docone[a]
                let { name, department } = docone[a]["applicantID"]
                let depart = (department == undefined) ? "N/A" : department
               
                if(!dep.includes(depart)){

                    dep.push(depart)
                }

                target_data.push({

                    department : department,
                    name : name,
                    type : type,
                    date : appliedDate,
                    period : period,
                    status : adminResponse,
                })
            }

            Promise.all(countArray)
            .then((countObj) => {
        
                let total = countObj[0] + countObj[1] + countObj[2]

                res.render('Admin/dashboard',{
                
                    depart : dep,
                    total : total,
                    approved : countObj[1],
                    disapproved : countObj[2],
                    pending : countObj[0],
                    leave : target_data,
                    title:'Admin dashboard',
                    csrfToken: req.csrfToken(),
                    userName: req.session.user.name,
                })

            })
        }
    })
})









// filter
router.get('/filter/:status/:date', function(req, res){

    let { status, date } = req.params;

    let departone = (status == "empty") ? "N/A" : status;
    
    const dataone = Leave.find({}).populate("applicantID")

    dataone.exec((error, docone) => {

        if(error)console.log(error)
        else{

            let target_data = []

            if(status == "All"){

                console.log('r')

                all_or_other(res, "All")
            }else{

                console.log('r')

                all_or_other(res, departone)
            }

            function all_or_other(res, departone){

                let pen = 0 // pending
                let app = 0 // approved
                let disa = 0 // disapproved
    
                for(let a = 0; a < docone.length; a++){
    
                    let { type, period, adminResponse, appliedDate } = docone[a]
                    let { name, department } = docone[a]["applicantID"]
    
                    let departwo = (department == undefined) ? "N/A" : department
    
                    let insideDate = new Date(appliedDate)

                    let year = insideDate.getFullYear()
                    let month = insideDate.getMonth() + 1
                    let datee = insideDate.getDate()

                    let full_time_format = `${year +'-'+
                                              ((month < 10) ? "0".concat(month) : month) +'-'+
                                              ((datee < 10) ? "0".concat(datee) : datee) }`


                    if(departone == "All"){
                        // filter by date and not department

                        if(date == full_time_format){

                            target_data.push({
    
                                department : departwo,
                                name : name,
                                type : type,
                                date : appliedDate,
                                period : period,
                                status : adminResponse,
                            })
                        }

                    }else if(departone == departwo){
                        // filter by department

                        if(adminResponse == "Pending"){
                            pen++
                        }
    
                        if(adminResponse == "Approved"){
                            app++
                        }
    
                        if(adminResponse == "Disapproved"){
                            disa++
                        }
    
                        if(date !== "null"){
    
                            if(date == full_time_format){

                                target_data.push({
        
                                    department : departwo,
                                    name : name,
                                    type : type,
                                    date : appliedDate,
                                    period : period,
                                    status : adminResponse,
                                })

                            }

                        }else{

                            target_data.push({

                                department : departwo,
                                name : name,
                                type : type,
                                date : appliedDate,
                                period : period,
                                status : adminResponse,
                            })
                        
                        }
                    }
                }
    
                let total = (app + disa + pen)
    
                res.send({ app, disa, pen, total, target_data })
            }
        }
    })
})



















router.post('/downloads', function(req, res){

    let { status, date } = req.body;

    const dataone = Leave.find({}).populate("applicantID")

    dataone.exec((error, docone) => {

        if(error)console.log(error)
        else{

            let target_data = []

            if(status == "All"){

                all_or_other("All")
            }else{

                all_or_other(status)
            }

            async function all_or_other(departone){

                let pen = 0 // pending
                let app = 0 // approved
                let disa = 0 // disapproved
    
                for(let a = 0; a < docone.length; a++){
    
                    let { type, period, adminResponse, appliedDate } = docone[a]
                    let { name, department } = docone[a]["applicantID"]
    
                    let departwo = (department == undefined) ? "N/A" : department
    
                    let insideDate = new Date(appliedDate)

                    let year = insideDate.getFullYear()
                    let month = insideDate.getMonth() + 1
                    let datee = insideDate.getDate()

                    let full_time_format = `${year +'-'+
                                              ((month < 10) ? "0".concat(month) : month) +'-'+
                                              ((datee < 10) ? "0".concat(datee) : datee) }`


                    if(departone == "All"){
                        // filter by date and not department

                        if(date == "null"){

                            target_data.push({
    
                                department : departwo,
                                name : name,
                                type : type,
                                date : appliedDate,
                                period : period,
                                status : adminResponse,
                            })

                        }else if(date == full_time_format){

                            target_data.push({
    
                                department : departwo,
                                name : name,
                                type : type,
                                date : appliedDate,
                                period : period,
                                status : adminResponse,
                            })
                        }

                    }else if(departone == departwo){
                        // filter by department

                        if(adminResponse == "Pending"){
                            pen++
                        }
    
                        if(adminResponse == "Approved"){
                            app++
                        }
    
                        if(adminResponse == "Disapproved"){
                            disa++
                        }
    
                        if(date !== "null"){
    
                            if(date == full_time_format){

                                target_data.push({
        
                                    department : departwo,
                                    name : name,
                                    type : type,
                                    date : appliedDate,
                                    period : period,
                                    status : adminResponse,
                                })

                            }

                        }else{

                            target_data.push({

                                department : departwo,
                                name : name,
                                type : type,
                                date : appliedDate,
                                period : period,
                                status : adminResponse,
                            })
                        
                        }
                    }
                }
    
                let appDir = path.dirname(require.main.filename);

                
                let target_data = [
                {Department:"Commercial",
                Name:"	mnepo juma",Type:"Martenity leave",AppliedDate:"	2020-08-06T10:02:51.201Z",Period:'84', Status:"	Approved"},
                {Department:"Commercial",
                Name:"	mnepo juma",Type:"	Special Leave",AppliedDate:"	2020-08-06T10:02:51.201Z",Period:'5', Status:"	Pending"}
            ]
                     let xls = json2xls(target_data)

                let filename = new Date().getTime()

                let file = `${path.join(appDir, '/public/uploaded/xls/') +  (filename + ".xlsx") }`

                await fs.writeFile(file, xls, "binary", (err) => {
                    
                    if (err) throw err;

                    console.log("file save successful")

                    res.download(file, error => {

                        console.log("Error during file downloads: ", error)
                    })
                });
            }
        }

    })
    // .catch(e => {

    //     console.log(e)
    // })
})



// admin trasining home1
router.get('/traininghome', function traininghome(req, res, next) {
    res.render('Admin/traininghome', {
        title: 'Admin training home',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});
//employee status
// router.post('/user/status/update', adminController.postStaffStatus);

// admin dashboard for training management system
// router.get('/dashboardtraining',function dashboard(req,res,next){
//     let gt, lt,g;
//     Leave.find({})
//     .then(result=>{
//       console.log(result)
//         res.render('Admin/dashboard',{
//             title:'Admin dashboard',
//             result:result,
//             userName: req.session.user.name
        
//     })
//     })
  
//       .catch(err => console.error(err));
   
// })

//admin uploading document of material
router.get('/upload', function uploadmaterial(req, res, next) {
    res.render('users/index', {
        title: 'training materials',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });

});


router.post('/training', [


], staffController.postmaterial);

// router.post('/training',function(req,res,next){

//     let { attachment,date } = req.file;
    
//     let material = new Material({
//         attachment:attachment,
//         date:date
        
//     })
//     material.save(function(err ,doc){
//         if(err){
//             console.log('data not saved')
//         }
//         else{
//             res.redirect('/admin/upload')
//             console.log('data saved successfully')
//         }
//     })

    

// })


// const Department = require('../models/department')

//view the uploaded employee reports
router.get('/viewuploadedreport',function viewuploadedreport(req,res,next){
    
    var reportChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    Request.find({}).sort({_id: -1}).exec(function findAllRequests(err, docs) {
        var hasReport = 0;
        if (docs.length > 0) {
            hasReport = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            reportChunks.push(docs[i])
        }
        for (var i = 0; i < reportChunks.length; i++) {
    
    User.findById(reportChunks[i].applicantID, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        employeeChunks.push(user);

    })
        }
        setTimeout(render_view, 900);
        function render_view() {
        res.render('Admin/viewuploadedreport',{
            title:'view training report',
            hasReport:hasReport,
            request:reportChunks,
            csrfToken: req.csrfToken(),
            userName: req.session.user.name,
            employees: employeeChunks, moment: moment,
        
    })
}
    })
  
      .catch(err => console.error(err));
   
})

//view all training requesting by the employee
router.get('/viewTrainingrequest',function viewuploadedreport(req,res,next){
    
    var RequestChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    Trequest.find({}).sort({_id: -1}).exec(function findAllRequests(err, docs) {
        var hasTraining = 0;
        if (docs.length > 0) {
            hasTraining = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            RequestChunks.push(docs[i])
        }
        for (var i = 0; i < RequestChunks.length; i++) {
    
    User.findById(RequestChunks[i].applicantID, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        employeeChunks.push(user);

    })
        }
        setTimeout(render_view, 900);
        function render_view() {
        res.render('Admin/viewTrainingrequest',{
            title:'view training request',
            hasTraining:hasTraining,
            request:RequestChunks,
            userName: req.session.user.name,
            employees: employeeChunks, moment: moment,
        
    })
}
    })
  
      .catch(err => console.error(err));
   
})

//dowload the documents
router.get('/download',(req,res)=>{  
    Request.find({_id:req.params.id},(err,data)=>{  
        if(err){  
            console.log(err)  
        }   
        else{  
            console.log(data)
           var path =  path.dirname(require.main.filename);  
           res.download(path);  
        }  
    })  
})





// view the list of departments
router.get('/department', function department(req, res, next) {
    Department.find({})
    .then(item=>{
        res.render('Admin/viewdepartment', {
            item:item,
            title: 'List of departments',
            csrfToken: req.csrfToken(),
            userName: req.session.user.name
        });
    })
 

});
//add department 
router.post('/department',(req,res,next)=>{

    let { departmentName } = req.body
    // console.log({departmentName})


    // console.log({ appdate, leave, period })

    Department.findOne({ "type" : departmentName }, function(error, docone){

        if(error){
            console.log("Error: ", error);
        }else{

            if(!docone){

                let dataone = new Department({

                    type:departmentName,
                    
                })

                dataone.save(function(error, result){

                    if(error) console.log("Error: ", error);
                    else{

                        res.redirect('/admin/department')     
                        console.log("document saved successfull");
                    }
                })

            }else{
                res.redirect('/admin/department')       
            }
        }
    })
})


//profile
router.get('/view-profile', function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('Admin/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });

});


//   Sorts the list of employees in User Schema.
//   Such that latest records are shown first.
//   Then displays list of all employees to the admin.


router.get('/view-all-employees', function viewAllEmployees(req, res, next) {

    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    User.find({$or: [{type: 'employee'}, {type: 'commercial_manager'}, 
    {type: 'financial_manager'}, {type: 'technical_manager'}, {type: 'human_resource_manager'}]}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        res.render('Admin/viewAllEmployee', {
            title: 'All Employees',
            csrfToken: req.csrfToken(),
            users: userChunks,
            userName: req.session.user.name
        });
    });


});


//   Displays add employee form to the admin.


router.get('/add-employee', function addEmployee(req, res, next) {
    Department.find( {}, { _id : 0, type : 1 },function(error,docone){
        if(error)console.log('Error:',error);
        else{
         let type=[]
         for(let a = 0; a < docone.length; a++){
             if(!type.includes(docone[a]['type'])){
                 type.push(docone[a]['type'])
             }
         }
      
   
    var messages = req.flash('error');
    var newUser = new User();

    res.render('Admin/addEmployee', {
        title: 'Add Employee',
        csrfToken: req.csrfToken(),
        user: config_passport.User,
          type : type,
        messages: messages,
        hasErrors: messages.length > 0,
        userName: req.session.user.name
    });
}
})
});

//   First it gets the id of the given employee from the parameters.
//   Finds the project of the employee from Project Schema with the help of that id.
//   Then displays all the projects of the given employee.
 
// router.get('/all-employee-projects/:id', function getAllEmployeePojects(req, res, next) {
//     var employeeId = req.params.id;
//     var projectChunks = [];

//     //find is asynchronous function
//     Project.find({employeeID: employeeId}).sort({_id: -1}).exec(function findProjectOfEmployee(err, docs) {
//         var hasProject = 0;
//         if (docs.length > 0) {
//             hasProject = 1;
//         }
//         for (var i = 0; i < docs.length; i++) {
//             projectChunks.push(docs[i]);
//         }
//         User.findById(employeeId, function getUser(err, user) {
//             if (err) {
//                 console.log(err);
//             }
//             res.render('Admin/employeeAllProjects', {
//                 title: 'List Of Employee Projects',
//                 hasProject: hasProject,
//                 projects: projectChunks,
//                 csrfToken: req.csrfToken(),
//                 user: user,
//                 userName: req.session.user.name
//             });
//         });

//     });
// });


// show the lists of all leave application aplied by theemployees
router.get('/leave-applications', function getLeaveApplications(req, res, next) {

    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    Leave.find({}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i])
        }
        for (var i = 0; i < leaveChunks.length; i++) {

            User.findById(leaveChunks[i].applicantID, function getUser(err, user) {
                if (err) {
                    console.log(err);
                }
                employeeChunks.push(user);

            })
        }

        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 900);
        function render_view() {
            res.render('Admin/allApplications', {
                title: 'List Of Leave Applications',
                csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });

});

//   Gets the leave id and employee id from the parameters.
//   Then shows the response application form of that leave of the employee to the admin.

router.get('/respond-application/:leave_id/:employee_id', function respondApplication(req, res, next) {
    var leaveID = req.params.leave_id;
    var employeeID = req.params.employee_id;
    Leave.findById(leaveID, function getLeave(err, leave) {

        if (err) {
            console.log(err);
        }
        User.findById(employeeID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Admin/applicationResponse', {
                title: 'Respond Leave Application',
                csrfToken: req.csrfToken(),
                leave: leave,
                employee: user,
                moment: moment, userName: req.session.user.name
            });


        })


    });


});


//display the reasons approved by the manager
router.get('/manager-reasons/:leave_id/:employee_id', function respondApplication(req, res, next) {
    var leaveID = req.params.leave_id;
    var employeeID = req.params.employee_id;
    Leave.findById(leaveID, function getLeave(err, leave) {

        if (err) {
            console.log(err);
        }
        User.findById(employeeID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Admin/managerrespond', {
                title: 'Respond Leave Application',
                csrfToken: req.csrfToken(),
                leave: leave,
                employee: user,
                moment: moment, userName: req.session.user.name
            });


        })


    });


});
//  Displays profile of the employee with the help of the id of the employee from the parameters.

router.get('/employee-profile/:id', function getEmployeeProfile(req, res, next) {
    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('Admin/employeeProfile', {
            title: 'Employee Profile',
            employee: user,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });
});



//   Displays edit employee form to the admin.
 
router.get('/edit-employee/:id', function editEmployee(req, res, next) {
    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/admin/');
        }
        res.render('Admin/editEmployee', {
            title: 'Edit Employee',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});


//   Redirects admin to the employee profile page.

router.get('/redirect-employee-profile', function viewEmployeeProfile(req, res, next) {
    var employeeId = req.user.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/employee-profile/' + employeeId);

    });

});
//geting the leave types by the admin
router.get('/create-leave',(req,res)=>{

    modeLeave.find({}).then(type=>{
        res.render('Admin/viewcreatedleave',{
            types:type,
            title:'admin create leave types',
            csrfToken: req.csrfToken(),
            moment: moment,
            message: '',
            userName: req.session.user.name
        })
    })
})

//cerating leave type  
router.post('/create-leave',(req,res,next)=>{

    let { appdate, leave, period } = req.body

    modeLeave.findOne({ "type" : leave }, function(error, docone){

        if(error){
            console.log("Error: ", error);
        }else{

            if(!docone){

                let dataone = new modeLeave({

                    type :leave,
                    appdate: appdate,
                    period : period
                })

                dataone.save(function(error, result){

                    if(error) console.log("Error: ", error);
                    else{

                        res.redirect('/admin/create-leave')     
                        console.log("document saved successfull");
                    }
                })

            }else{
                res.redirect('/admin/create-leave')       
            }
        }
    })

    // const leavetype = new Leavetype();
    // leavetype.leave = req.body.leave;
    // leavetype.code = req.body.code;
    // leavetype.name = req.body.name;
    // leavetype.appdate = req.body.appdate;
    // leavetype.period = req.body.period;
    // leavetype.save((err,doc)=>{
    //     if(!err){
    //         res.redirect('/admin/create-leave')
    //     }
    //     else{
    //         console.log('data not posted in db')
    //     }
    // })
})

// delete leave

router.post('/delete-leave/:id', function deleteleave(req, res) {
    var id = req.params.id;
    modeLeave.findByIdAndRemove({_id: id}, function deleteleave(err) {
        if (err) {
            console.log('unable to delete employee');
        }
        else {
            res.redirect('/admin/create-leave');
        }
    });
});


//get edit leave
router.get('/edit-leave/:id', function editleave(req, res, next) {
    var leaveId = req.params.id;
    modeLeave.findById(leaveId, function getLeave(err, type) {
        if (err) {
            res.redirect('/admin/');
        }
        res.render('Admin/editleave', {
            title: 'Edit Leave',
            csrfToken: req.csrfToken(),
            type: type,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});

//post the edited leave type


router.post('/edit-leave/:id', function editleave(req, res) {
    var leaveId = req.params.id;
    var newLeave = new modeLeave();

    modeLeave.findById(leaveId, function (err, type) {
        if (err) {
            console.log(err);
        }
        type.type = req.body.type;
        type.appdate = new Date(req.body.appdate)
         type.period = req.body.period;

        type.save(function saveleave(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/create-leave/' + leaveId);

        });
    });

});

//   Adds employee to the User Schema by getting attributes from the body of the post request.
//   Then redirects admin to the profile information page of the added employee.

router.post('/add-employee', passport.authenticate('local.add-employee', {
    successRedirect: '/admin/redirect-employee-profile',
    failureRedirect: '/admin/add-employee',
    failureFlash: true,
}));

//   Gets the id of the leave from the body of the post request.
//  Sets the response field of that leave according to response given by employee from body of the post request.
 
router.post('/respond-application', function respondApplication(req, res) {

    Leave.findById(req.body.leave_id, function getLeave(err, leave) {
        leave.adminResponse = req.body.status;
        leave.save(function saveLeave(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/leave-applications');
        })
    })


});


//   Gets the id of the employee from the parameters.
//   Gets the edited fields of the project from body of the post request.
//   Saves the update field to the project of the employee  in Project Schema.
//   Edits the project of the employee.


router.post('/edit-employee/:id', function editEmployee(req, res) {
    var employeeId = req.params.id;
    var newUser = new User();
    newUser.email = req.body.email;
    if (req.body.designation == "Accounts Manager") {
        newUser.type = "accounts_manager";
    }
    else if (req.body.designation == "Project Manager") {
        newUser.type = "project_manager";
    }
    else {
        newUser.type = "employee";
    }
    newUser.name = req.body.name,
        newUser.dateOfBirth = new Date(req.body.DOB),
        newUser.contactNumber = req.body.number,
        newUser.type = req.body.type;
    newUser.Skills = req.body['skills[]'];
    newUser.designation = req.body.designation;

    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/admin/');
        }
        if (user.email != req.body.email) {
            User.findOne({'email': req.body.email}, function getUser(err, user) {
                if (err) {
                    res.redirect('/admin/');
                }
                if (user) {
                    res.render('Admin/editEmployee', {
                        title: 'Edit Employee',
                        csrfToken: req.csrfToken(),
                        employee: newUser,
                        moment: moment,
                        message: 'Email is already in use', userName: req.session.user.name
                    });

                }
            });
        }
        user.email = req.body.email;
        if (req.body.designation == "Accounts Manager") {
            user.type = "accounts_manager";
        }
        else if (req.body.designation == "Project Manager") {
            user.type = "project_manager";
        }
        else {
            user.type = "employee";
        }
        user.name = req.body.name,
            user.dateOfBirth = new Date(req.body.DOB),
            user.contactNumber = req.body.number,
            user.type = req.body.type;
        user.Skills = req.body['skills[]'];
        user.designation = req.body.designation;

        user.save(function saveUser(err) {
            if (err) {
                console.log('Error:',err);
            }
            res.redirect('/admin/employee-profile/' + employeeId);

        });
    });

});

//   Gets the id of the employee from the parameters.
//  Gets the attributed of the the project from body of the post request.
//   Adds the the project of the employee in Project Schema.
 
router.post('/add-employee-project/:id', function addEmployeeProject(req, res) {
    var newProject = new Project();
    newProject.employeeID = req.params.id;
    newProject.title = req.body.title;
    newProject.type = req.body.type;
    newProject.startDate = new Date(req.body.start_date),
        newProject.endDate = new Date(req.body.end_date),
        newProject.description = req.body.description,
        newProject.status = req.body.status;

    newProject.save(function saveProject(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/employee-project-info/' + newProject._id);


    });

});


//   Gets the id of the employee from the parameters.
//  gets the edited fields of the project from body of the post request.
//   Saves the update field to the project of the employee  in Project Schema.
//  Edits the project of the employee.
 

router.post('/edit-employee-project/:id', function editEmployeeProject(req, res) {
    var projectId = req.params.id;
    var newProject = new Project();

    Project.findById(projectId, function (err, project) {
        if (err) {
            console.log(err);
        }
        project.title = req.body.title;
        project.type = req.body.type;
        project.startDate = new Date(req.body.start_date),
            project.endDate = new Date(req.body.end_date),
            project.description = req.body.description,
            project.status = req.body.status;

        project.save(function saveProject(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/employee-project-info/' + projectId);

        });
    });

});

//   Gets the id of the employeed to be deleted form the parameters.
//  Find the given employee from User Scheme.
//   Deleteth employee from User Schema.


router.post('/delete-employee/:id', function deleteEmployee(req, res) {
    var id = req.params.id;
    User.findByIdAndRemove({_id: id}, function deleteUser(err) {
        if (err) {
            console.log('unable to delete employee');
        }
        else {
            res.redirect('/admin/view-all-employees');
        }
    });
});

//posting the employee ststus
router.post('/user/status/update',function update(req,res){
    const is_active = req.body.is_active;
    const userId = req.body.userId;
    User.findOne({
            _id: userId
        })
        .then(user => {
            if (!user) {
                return next(new Error('An error occured'));
            }
            user.is_active = is_active;
            return user.save()
        })
        .then(() => {
            req.flash('error', 'Account setting changed!');
            res.redirect('/admin/view-all-employees');
        })
        .catch(err => {
            console.log(err);
        })
})



module.exports = router;


//  *Checks if user is logged in then redirects user to the his/her home page.
 

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


//   Checks if user is not logged in then redirects user to the login page.

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}