const Task = require('../models/Task');
const Comment = require('../models/Comment');

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, assigneeId } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assigneeId) filter.assigneeId = assigneeId;

    const tasks = await Task.find(filter)
      .populate('authorId', 'name')
      .populate('assigneeId', 'name')
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('authorId', 'name')
      .populate('assigneeId', 'name')
      .populate('projectId', 'name color');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId, dueDate, priority, status } = req.body;
    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      status: status || 'todo',
      authorId: req.user._id
    });
    await task.populate('authorId', 'name');
    await task.populate('assigneeId', 'name');
    await task.populate('projectId', 'name color');
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, assigneeId, dueDate, priority, status } = req.body;
    
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    const isAuthorOrAdmin = req.user.role === 'admin' || req.user._id.toString() === existingTask.authorId.toString();
    const isAssignee = existingTask.assigneeId && req.user._id.toString() === existingTask.assigneeId.toString();

    if (!isAuthorOrAdmin && !isAssignee) {
      return res.status(403).json({ error: 'Not authorized to edit this task' });
    }

    // Assignees can ONLY update the status if they are not the author or admin
    if (!isAuthorOrAdmin && isAssignee) {
      if (title !== undefined || description !== undefined || assigneeId !== undefined || dueDate !== undefined || priority !== undefined) {
         return res.status(403).json({ error: 'Assignees are only permitted to update the task status.' });
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, {
      ...(title && { title }),
      ...(description && { description }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(dueDate !== undefined && { dueDate }),
      ...(priority && { priority }),
      ...(status && { status })
    }, { new: true })
      .populate('authorId', 'name')
      .populate('assigneeId', 'name')
      .populate('projectId', 'name color');
      
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Comment.deleteMany({ taskId: task._id });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
