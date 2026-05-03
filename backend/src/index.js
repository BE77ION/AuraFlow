require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'AuraFlow API is running',
    version: '1.0.0',
    documentation: 'https://github.com/your-repo/auraflow',
    health: '/api/health'
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
