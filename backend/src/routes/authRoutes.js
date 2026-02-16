const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
} = require('../controller/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin, handleValidationErrors } = require('../validators/authValidator');

router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
