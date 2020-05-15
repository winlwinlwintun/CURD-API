const express = require('express');

const router = express.Router();

const userController = require('../controller/userController');

router.get('/', userController.getAllUser);
router.get('/:userID', userController.getOneUser);
router.post('/register', userController.userRegister);
router.put('/update/:userID', userController.updateuser);
router.delete('/delete/:userID', userController.deleteuser);

module.exports = router;