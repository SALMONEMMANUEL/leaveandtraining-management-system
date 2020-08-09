var express = require('express');
var path = require('path');
var logger = require('morgan');
var utilPath = require('./util/path')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
expressValidator = require('express-validator');
var session= require('express-session');
var passport= require('passport');
const csurf = require('csurf');
var flash= require('connect-flash');
var MongoStore= require('connect-mongo')(session);
const multer = require('multer');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'documents');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname);
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'document/png' || file.mimetype === 'document/jpg' || file.mimetype === 'document/jpe' || file.mimetype === 'document/jpeg') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var employee = require('./routes/employee');
var manager = require('./routes/manager');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/HRMSii',
{useNewUrlParser:true,
  
useUnifiedTopology:true
},(err)=>{
    if(err){
        console.log('no db connection')
    }
    else{
        console.log('db is connected')
    }
});

require('./config/passport.js');
var app = express();
const csrfProtection = csurf();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(multer({
  storage: fileStorage

}).single('document'));
app.use(express.static(path.join(utilPath, 'public')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//validator should be ater body parser
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/axios/dist")));
app.use(express.static(path.join(__dirname, "node_modules/vue/dist")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist")))
app.use(session({
  secret: 'mysupersecret', resave: false, saveUninitialized: false, store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie:{maxAge: 180*60*1000},
}));
app.use(csrfProtection);
;
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrf = req.csrfToken()
  next();
})
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/manager', manager);
app.use('/employee', employee);


app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.messages=req.flash();
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(8000,(err)=>{
  if(err){
    console.log('server is not started')
  }
  else{
    console.log('server has started at port 5000')
  }
})

module.exports = app;
