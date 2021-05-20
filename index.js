const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path')
const User = require('./role/models/userModel')
const routes = require('./role/routes/route.js');
const handlebars = require('express-handlebars');

require("dotenv").config({
 path: path.join(__dirname, "/role/.env")
});

const app = express();

const PORT = process.env.PORT || 3000;

mongoose
 .connect('mongodb://localhost:27017/rolebased')
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
//handlebars
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'admin',
    //new configuration parameter
    partialsDir: __dirname + '/views/partials/'
    }));
app.use(express.static('public'))
app.get('/', (req, res) => {
    //Using the index.hbs file instead of planB
    res.render('register', {layout: 'register'});});
//end handlebars

app.use('/', routes); app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT)
})