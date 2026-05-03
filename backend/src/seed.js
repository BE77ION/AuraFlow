require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Wiping database...');

    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Comment.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    console.log('Creating users...');
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password, role: 'admin' });
    const yuvraj = await User.create({ name: 'Yuvraj', email: 'yuvraj@test.com', password, role: 'member' });
    const mohit = await User.create({ name: 'Mohit', email: 'mohit@test.com', password, role: 'member' });
    const akhil = await User.create({ name: 'Akhil', email: 'akhil@test.com', password, role: 'member' });
    const prashant = await User.create({ name: 'Prashant', email: 'prashant@test.com', password, role: 'member' });

    console.log('Creating projects...');
    const projAlpha = await Project.create({ name: 'Project Alpha - V2 Rework', description: 'Complete overhaul of the core system.', color: '#8b5cf6' });
    const projBeta = await Project.create({ name: 'Project Beta - Mobile App', description: 'React Native mobile application build.', color: '#3b82f6' });

    console.log('Creating tasks...');
    
    // Dates for overdue tracking
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    const tasksData = [
      { title: 'Design Database Schema', desc: 'Map out all collections and relations.', status: 'done', priority: 'high', project: projAlpha._id, author: admin._id, assignee: yuvraj._id, due: lastWeek },
      { title: 'Setup Authentication', desc: 'Implement JWT based auth.', status: 'review', priority: 'urgent', project: projAlpha._id, author: admin._id, assignee: mohit._id, due: yesterday },
      { title: 'Build React Dashboard', desc: 'Create the main UI layout.', status: 'in_progress', priority: 'medium', project: projAlpha._id, author: yuvraj._id, assignee: yuvraj._id, due: tomorrow },
      { title: 'Fix Login Bug', desc: 'Tokens are expiring too early.', status: 'todo', priority: 'high', project: projBeta._id, author: mohit._id, assignee: akhil._id, due: yesterday }, // OVERDUE
      { title: 'Push to App Store', desc: 'Submit for review.', status: 'todo', priority: 'medium', project: projBeta._id, author: prashant._id, assignee: prashant._id, due: nextWeek },
      { title: 'Write Unit Tests', desc: 'Achieve 80% coverage on core.', status: 'in_progress', priority: 'low', project: projAlpha._id, author: akhil._id, assignee: akhil._id, due: today },
    ];

    for (let t of tasksData) {
      const task = await Task.create({
        title: t.title,
        description: t.desc,
        status: t.status,
        priority: t.priority,
        projectId: t.project,
        authorId: t.author,
        assigneeId: t.assignee,
        dueDate: t.due
      });

      if (Math.random() > 0.4) {
        await Comment.create({ text: 'Looks good, I will get started on this.', taskId: task._id, authorId: t.assignee });
      }
    }

    console.log('✅ Seeding complete! You can log in with admin@test.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
