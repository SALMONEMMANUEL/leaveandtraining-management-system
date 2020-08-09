const Request = require("../models/training/upload");
const moment = require('moment');
const Material = require('../models/training/material');
const path = require('path');
const User = require('../models/user')
const fs = require('fs');

const PDFDocument = require('pdfkit');
 
// const   {validationResult} = require('express-validator');
exports.getIndex = (req, res, next) => {
    Request.find({
            
        })
        .then(request => {
            res.render('Employee/uploadreport', {
                page: '/',
                title:'resources uploaded',
                userName:req.session.user.name,
                requests: request,
                errorMessage: null,
                validationCSS: [],
                oldValue: {
                   
                }
            })
        })
        .catch(err => {
            console.log(err);
        })
}
exports.postLeave = (req, res, next) => {
    const document = req.file.filename;

    // const errors = validationResult(req);
    // console.log(duration,category,document)

    // if (!document) {
    //     return res.status(422).render('admin/edit-product', {
    //         pagetitle: 'LAMS',
    //         page: '/',
    //         editing: false,
    //         errorMessage: 'Image needs to be a document..',
    //         validationCSS: errors.array(),
    //         oldValue: {
                
    //         }
    //     })
    // }
    // if (!errors.isEmpty()) {
    //     return res.status(422).render('users/index', {
    //         pagetitle: 'LAMS',
    //         page: '/',
    //         errorMessage: errors.array()[0].msg,
    //         validationCSS: errors.array(),
    //         oldValue: {
              
    //         }
    //     })
    // }

    const request = new Request({
        applicantID: req.user._id,
        attachment: document,
        date: moment().format('MMMM Do YYYY, h:mm:ss a')
    });
    request.save()
        .then(() => {
            return res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postmaterial = (req, res, next) => {
    const document = req.file.filename;
    const material = new Material({
        attachment: document,
        date: moment().format('MMMM Do YYYY, h:mm:ss a')
    });
    material.save()
        .then(() => {
            return res.redirect('/admin/upload');
        })
        .catch(err => {
            console.log(err);
        })
}
//employee status configuration
// exports.postStaffStatus = (req, res, next) => {
//     const is_active = req.body.is_active;
//     const userId = req.body.userId;
//     User.findOne({
//             _id: userId
//         })
//         .then(user => {
//             if (!user) {
//                 return next(new Error('An error occured'));
//             }
//             user.is_active = is_active;
//             return user.save();
//         })
//         .then(() => {
//             req.flash('error', 'Account setting changed!');
//             res.redirect('/admin/users');
//         })
//         .catch(err => {
//             console.log(err);
//         })
// }