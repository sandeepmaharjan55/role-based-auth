const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('../roles/roles')
async function hashPassword(password) {
 return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
 return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
 try {
  if(req.body.email=='' || req.body.password=='' || req.body.confirm == ''){
    req.session.message = {
      type: 'danger',
      intro: 'Empty fields! ',
      message: 'Please insert the requested information.'
    }
    res.redirect('/')
  }
  else if(req.body.password != req.body.confirm){
    req.session.message = {
      type: 'danger',
      intro: 'Passwords do not match! ',
      message: 'Please make sure to insert the same password.'
    }
    res.redirect('/')
  }
  else{
    //  console.log(req.body.email, req.body.password)
    const duplicateUser = await User.findOne({email: req.body.email });

    if(duplicateUser!=null)
    {
      req.session.message = {
        type: 'danger',
        intro: 'Email already exists ',
        message: 'Use different email'
      }

       res.redirect('/');
    }
    else
    {
      const { email, password, role } = req.body;
      const hashedPassword = await hashPassword(password);
      const newUser = new User({ email, password: hashedPassword, role: role || "basic" });
      const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
       expiresIn: "1d"
      });
      newUser.accessToken = accessToken;
      await newUser.save();
      // res.json({
      //  data: newUser,
      //  accessToken
      // })
      req.session.message = {
        type: 'success',
        intro: 'You are now registered! ',
        message: 'Please log in.'
      }

       res.redirect('/login');
    }

  }
 } catch (error) {
  next(error)
 }
}

exports.login = async (req, res, next) => {
 try {
  if(req.body.email=='' || req.body.password==''){
    req.session.message = {
      type: 'danger',
      intro: 'Empty fields! ',
      message: 'Please insert the requested information.'
    }
    res.redirect('/login')
  }
   else{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error('Email does not exist'));
  const validPassword = await validatePassword(password, user.password);
  if (!validPassword) return next(new Error('Password is not correct'))
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
   expiresIn: "1d"
  });
  await User.findByIdAndUpdate(user._id, { accessToken })
  // res.status(200).json({
  //  data: { email: user.email, role: user.role },
  //  accessToken
  // })
  req.session.message = {
    type: 'success',
    intro: 'You are Logged in! ',
    message: 'Welcome '+user.email
  }
  //  res.status(200).json({
  //  data: { email: user.email, role: user.role },
  //  accessToken
  // })
  req.session.userMail=user.email;
  res.redirect('/');
}
 } catch (error) {
  next(error);
 }
}

exports.logout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect('/');
  }
  catch (error) {
    next(error)
   }
  }
exports.getUsers = async (req, res, next) => {
 const users = await User.find({});
 res.status(200).json({
  data: users
 });
}

exports.getUser = async (req, res, next) => {
 try {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) return next(new Error('User does not exist'));
   res.status(200).json({
   data: user
  });
 } catch (error) {
  next(error)
 }
}

exports.updateUser = async (req, res, next) => {
 try {
  const update = req.body
  const userId = req.params.userId;
  await User.findByIdAndUpdate(userId, update);
  const user = await User.findById(userId)
  res.status(200).json({
   data: user,
   message: 'User has been updated'
  });
 } catch (error) {
  next(error)
 }
}

exports.deleteUser = async (req, res, next) => {
 try {
  const userId = req.params.userId;
  await User.findByIdAndDelete(userId);
  res.status(200).json({
   data: null,
   message: 'User has been deleted'
  });
 } catch (error) {
  next(error)
 }
}

exports.grantAccess = function(action, resource) {
 return async (req, res, next) => {
  try {
   const permission = roles.can(req.user.role)[action](resource);
   if (!permission.granted) {
    return res.status(401).json({
     error: "You don't have enough permission to perform this action"
    });
   }
   next()
  } catch (error) {
   next(error)
  }
 }
}

exports.allowIfLoggedin = async (req, res, next) => {
 try {
  const user = res.locals.loggedInUser;
  if (!user)
   return res.status(401).json({
    error: "You need to be logged in to access this route"
   });
   req.user = user;
   next();
  } catch (error) {
   next(error);
  }
}