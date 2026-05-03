const express = require('express');
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getTasks);
router.get('/:id', requireAuth, getTaskById);
router.post('/', requireAuth, createTask);
router.patch('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);

module.exports = router;
