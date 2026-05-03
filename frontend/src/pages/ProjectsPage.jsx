import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, X, Folder } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', color: '#7c6fef' });

  useEffect(() => {
    api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#7c6fef' });
      toast.success('Project created');
    } catch {
      toast.error('Failed to create project');
    }
  };

  if (loading) return <div className="loading-screen">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      <div className="project-grid">
        {projects.map(p => (
          <Link
            key={p._id}
            to={`/project/${p._id}`}
            className="project-card"
            style={{ '--project-color': p.color }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 8px ${p.color}55` }} />
              <div className="project-card-name">{p.name}</div>
            </div>
            <p className="project-card-desc">{p.description || 'No description'}</p>
          </Link>
        ))}

        {projects.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <Folder size={28} style={{ color: 'var(--text-3)', marginBottom: 10 }} />
            <div style={{ fontWeight: 500, color: 'var(--text-2)' }}>No projects yet</div>
            <div style={{ marginTop: 4 }}>Ask an admin to create a project.</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>New Project</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus placeholder="e.g. Website Redesign" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What is this project about?" />
              </div>
              <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="form-input" style={{ padding: 3, height: 38, width: 60 }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Choose a color for the project</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
