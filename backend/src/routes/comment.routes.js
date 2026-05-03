const express = require('express');
const { getCommentsForTask, addComment, deleteComment } = require('../controllers/comment.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:taskId', requireAuth, getCommentsForTask);
router.post('/', requireAuth, addComment);
router.delete('/:id', requireAuth, deleteComment);

module.exports = router;
