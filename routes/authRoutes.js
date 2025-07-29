const express = require('express');
const { registerUser, loginUser, getUserDetails, getAllUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register',protect, registerUser);
router.post('/login', protect, loginUser);
router.get('/details', protect, getUserDetails);
router.get('/allUsers', getAllUser);

module.exports = router;
