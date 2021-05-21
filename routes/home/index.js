// server/routes/route.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.post('/signup', userController.signup);

router.post('/login', userController.login);

// router.get('/', (req, res) => {
//     console.log(req.session.userMail);
//     userName=req.session.userMail
//     // res.render('index', user:userName);
//     res.render("index", {
//         user:userName
//     });
// });
router.get('/logout', userController.logout);
router.get('/user/:userId', userController.allowIfLoggedin, userController.getUser);

router.get('/users', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.getUsers);

router.put('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'profile'), userController.updateUser);

router.delete('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'profile'), userController.deleteUser);

module.exports = router;