var express = require('express');
var router = express.Router();
var Leave = require('../models/leave');
var Attendance = require('../models/attendance');
var Project = require('../models/project');
var moment = require('moment');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
var moment = require('moment');
// var Leavetype = require('../models/createleave')
var mongoose = require('mongoose')

let modeLeave = require('../models/leavee');

router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
    next();
});



router.get('/', function viewHome(req, res, next) {
    res.render('Employee/employeeHome', {
        title: 'Home',
        userName: req.session.user.name,
        csrfToken: req.csrfToken()
    });
});
// aplly  for leave
router.get('/apply-for-leave', function applyForLeave(req, res, next) {
    
    modeLeave.find({}, { _id : 0, type : 1 }, function(error, docone){

        if(error) console.log("Error: ", error);
        else{

            let type = []

            for(let a = 0; a < docone.length; a++){

                if(!type.includes(docone[a]["type"])){

                    type.push(docone[a]["type"])
                }
            }

            res.render('Employee/applyForLeave', {
                title: 'Apply for Leave',
                type : type,
                csrfToken: req.csrfToken(),
                userName: req.session.user.name
            });
        }
    })
});
// display the list of the applied leave

router.get('/applied-leaves', function viewAppliedLeaves(req, res, next) {
    var leaveChunks = [];

    //find is asynchronous function
    Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i]);
        }

        res.render('Employee/appliedLeaves', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name
        });
    });

});
// training viewHome
router.get('/traininghome', function traininghome(req, res, next) {
    res.render('Employee/traininghome', {
        title: 'homeTraining',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});

// display the training  application form
router.get('/apply-for-training', function applyForTraining(req, res, next) {
    res.render('Employee/appyForTraining', {
        title: 'Apply for Training',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});


 
//   Displays employee his/her profile.


router.get('/view-profile', function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Employee/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });

});
// post the applied leave in the database
router.post('/apply-for-leave', function applyForLeave(req, res, next) {

    let { title, type, start_date, end_date, reason } = req.body
    
    modeLeave.findOne({ type : type }, { _id : 0, period : 1 }, (error, docone) => {

        if(error) console.log("Error: ", error);
        else{

            let period = docone["period"]

            // console.log({ title, type, period, start_date, end_date, reason })

            let dataone = new Leave({

                applicantID: req.user._id,
                title: title,
                type: type,
                startDate: start_date,
                endDate: end_date,
                period: period,
                reason: reason,
                adminResponse: "Pending"
            })

            dataone.save((error, result) => {

                if(error) console.log("Error: ", error);
                else{
                    
                    res.redirect('/employee/applied-leaves');
                    console.log("data saved successfull");
                }
            })
        }
    })

    // let dict = {
    //     "Sick Leave" : 14,
    //     "Maternity Leave": 80,
    //     "Special leave": 7,
    //     "Half leave": 14,
    //     "paternity leave": 14,
    //     "Annual leave": 28
    // }

    // let period_of_leave = dict[req.body.type]

    // var newLeave = new Leave();
    // newLeave.applicantID = req.user._id;
    // newLeave.leave = req.body.leaveID;
    // newLeave.title = req.body.title;
    // newLeave.period = ""; 
    // newLeave.type = req.body.type;
    // newLeave.startDate = new Date(req.body.start_date);
    // newLeave.endDate = new Date(req.body.end_date);
    // newLeave.reason = req.body.reason;
    // newLeave.appliedDate = new Date();
    // newLeave.adminResponse = 'Pending';
    // // newLeave.save()
    // // .then(result=>{
    // //     console.log(result)
    // // })
    // // .catch(err=>{
    // //     console.log(err)
    
    // // })
    // newLeave.save(function saveLeave(err) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.redirect('/employee/applied-leaves');
    // });

});

//post the mark atttendance
router.post('/mark-employee-attendance', function markEmployeeAttendance(req, res, next) {

    Attendance.find({
        employeeID: req.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear()
    }, function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        else {

            var newAttendance = new Attendance();
            newAttendance.employeeID = req.user._id;
            newAttendance.year = new Date().getFullYear();
            newAttendance.month = new Date().getMonth() + 1;
            newAttendance.date = new Date().getDate();
            newAttendance.present = 1;
            newAttendance.save(function saveAttendance(err) {
                if (err) {
                    console.log(err);
                }

            });
        }
        res.redirect('/employee/view-attendance-current');

    });


});
module.exports = router;



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}