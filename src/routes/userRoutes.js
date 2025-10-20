const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);
router.post('/login', userController.loginUser);
router.post('/', userController.signUpUser);
router.put('/', userController.updateUserProfile);
router.delete('/:id', userController.deleteUserProfile);

module.exports = router