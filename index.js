const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path')
const {mongoDbUrl}= require("./config/database");
const User = require('./models/userModel')
const routes = require('./routes/home/route.js');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser')
const session = require('express-session')
require("dotenv").config({
 path: path.join(__dirname, ".env")
});

const app = express();

const PORT = process.env.PORT || 5000;

mongoose
 .connect(mongoDbUrl, { useNewUrlParser: true })
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
app.use(session({cookie: {maxAge: null}}))

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
    defaultLayout: 'admin',
    //new configuration parameter
    partialsDir: __dirname + '/views/partials/'
    }));
//end handlebars
app.get('/', (req, res) => {
    //Using the index.hbs file instead of planB
    res.render('register', {layout: 'register'});});
app.get('/login', (req, res) => {
      //Using the index.hbs file instead of planB
res.render('login', {layout: 'register'});});
app.use('/', routes); app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT)
})