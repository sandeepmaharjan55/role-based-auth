const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path')
const {mongoDbUrl}= require("./config/database");
const User = require('./models/userModel')
const routes = require('./routes/home/index.js');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser')
const session = require('express-session')
require("dotenv").config({
 path: path.join(__dirname, ".env")
});

const app = express();

const PORT = process.env.PORT || 5000;

mongoose
 .connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => {
  console.log('Connected to the Database successfully');
 });

app.use(bodyParser.urlencoded({ extended: true }));


app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
   const accessToken = req.headers["x-access-token"];
   const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
   // Check if token has expired
   if (exp < Date.now().valueOf() / 1000) {
    return res.status(401).json({
     error: "JWT token has expired, please login to obtain a new one"
    });
   }
   res.locals.loggedInUser = await User.findById(userId);
   next();
  } else {
   next();
  }
});
//middlewares
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser('secret'))
app.use(session({
  secret: 'R6ZXFKEMsSCaenDy5EmgRX5ZI3IedSRu7SD6H7xI37tnV91bwuibbEJIS52hAXPYS3Hej',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: null }
}))

//flash message middleware
app.use((req, res, next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

//handlebars
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'register',
    //new configuration parameter
    partialsDir: __dirname + '/views/partials/'
    }));
//end handlebars
// app.get('/', (req, res) => {
//     res.render('index', {layout: 'register'});});
app.get('/', (req, res) => {
  // console.log(req.session.userMail);
  userName=req.session.userMail;
  // res.render('index', user:userName);
  res.render('index', {
      user:userName
  });
});
app.get('/signup', (req, res) => {
      res.render('register', {layout: 'register'});});

app.get('/login', (req, res) => {
res.render('login', {layout: 'login'});});


app.use('/', routes); app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT)
})