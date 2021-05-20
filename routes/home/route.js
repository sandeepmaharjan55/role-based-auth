// server/routes/route.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const User = require('../../models/userModel');

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/index', (req, res) => {
console.log(req.session.email);
    // User.findOne({_id: req.params.id})
    // .then(user =>{

    //     res.render('/index', {user: user});
    //         });
    res.render('index', {layout: 'register'});
});


router.get('/user/:userId', userController.allowIfLoggedin, userController.getUser);

router.get('/users', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.getUsers);

router.put('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'profile'), userController.updateUser);

router.delete('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'profile'), userController.deleteUser);

module.exports = router;