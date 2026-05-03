const express = require('express');
const { getProjects, createProject, getProjectById } = require('../controllers/project.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getProjects);
router.get('/:id', requireAuth, getProjectById);
router.post('/', requireAuth, requireAdmin, createProject);

module.exports = router;
