const express = require('express');
const { getUsers, deleteUser, promoteUser, demoteUser, updateProfile, changePassword } = require('../controllers/user.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getUsers);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);
router.patch('/:id/promote', requireAuth, requireAdmin, promoteUser);
router.patch('/:id/demote', requireAuth, requireAdmin, demoteUser);

// Profile management (any authenticated user)
router.patch('/me/profile', requireAuth, updateProfile);
router.patch('/me/password', requireAuth, changePassword);

module.exports = router;
