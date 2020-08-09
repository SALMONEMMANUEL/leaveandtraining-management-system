var passport = require('passport');
var User = require('../models/user');
const department = require('../models/department');
const { populate } = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.add-employee', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // is_active: 1,
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 6});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }

        var newUser = new User();
        newUser.email = email;
        if (req.body.designation == "Financial Manager") {
            newUser.type = "financial_manager";
        }
        else if (req.body.designation == "Commercial Manager") {
            newUser.type = "commercial_manager";
        }
        else if (req.body.designation == "Technical Manager") {
            newUser.type = "technical_manager";
        }
        else if (req.body.designation == "Human Resource Manager") {
            newUser.type = "human_resource_manager";
        }
        else {
            newUser.type = "employee";
        }
        newUser.password = newUser.encryptPassword(password);
    //    newUser.is_active = 1;
        newUser.name = req.body.name,
            newUser.dateOfBirth = new Date(req.body.DOB),
            newUser.contactNumber = req.body.number,
            newUser.department = req.body.department;
        newUser.Skills = req.body['skills[]'];
        newUser.designation = req.body.designation;
        newUser.dateAdded = new Date();

        if (user) {
            exports.User = newUser;
            return done(null, false, {message: 'Email is already in use'});
        }
        newUser.save(function (err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));


passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // is_active: 1,
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    // req.checkBody('is_active',"0")
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Incorrect email or password'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect email or password'});
        }
        return done(null, user);
    });
}));