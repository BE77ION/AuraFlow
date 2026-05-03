const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#3b82f6' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
