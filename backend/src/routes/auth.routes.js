const express = require('express');
const { check } = require('express-validator');
const { signup, login, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], signup);

router.post('/login', login);
router.get('/me', requireAuth, getMe);

module.exports = router;
