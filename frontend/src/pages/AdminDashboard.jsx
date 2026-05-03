import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, Trash2, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading]   = useState(true);
  const [newProjectName, setNewProjectName]   = useState('');
  const [newProjectDesc, setNewProjectDesc]   = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#7c6fef');

  const load = async () => {
    try {
      const [u, p, t] = await Promise.all([api.get('/users'), api.get('/projects'), api.get('/tasks')]);
      setUsers(u.data); setProjects(p.data); setTasks(t.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const { data } = await api.post('/projects', { name: newProjectName, description: newProjectDesc, color: newProjectColor });
      setProjects([data, ...projects]);
      setNewProjectName(''); setNewProjectDesc('');
      toast.success('Project created');
    } catch { toast.error('Failed to create project'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const promoteUser = async (id) => {
    try {
      await api.patch(`/users/${id}/promote`);
      setUsers(users.map(u => u._id === id ? { ...u, role: 'admin' } : u));
      toast.success('User promoted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to promote');
    }
  };

  const demoteUser = async (id) => {
    try {
      await api.patch(`/users/${id}/demote`);
      setUsers(users.map(u => u._id === id ? { ...u, role: 'member' } : u));
      toast.success('User demoted');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to demote');
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, { status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  if (loading) return <div className="loading-screen">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2 page-title">
            <ShieldCheck size={22} style={{ color: 'var(--accent)' }} /> Admin
          </h1>
          <p className="page-subtitle">Manage tasks, projects, and users</p>
        </div>
      </div>

      <div className="tabs">
        {[['tasks', 'Tasks'], ['projects', 'Projects'], ['users', 'Users']].map(([key, label]) => (
          <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Tasks ── */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{tasks.length} tasks total</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{t.title}</td>
                    <td>
                      {t.projectId && (
                        <div className="flex items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.projectId.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.82rem' }}>{t.projectId.name}</span>
                        </div>
                      )}
                    </td>
                    <td>{t.assigneeId?.name || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                    <td>
                      <select
                        className="form-input"
                        style={{ width: 140, padding: '4px 10px', fontSize: '0.8rem' }}
                        value={t.status}
                        onChange={e => updateTaskStatus(t._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-icon btn-danger-ghost btn-sm" onClick={() => deleteTask(t._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Create */}
          <div className="card card-sm">
            <h3 style={{ fontSize: '0.875rem', marginBottom: 16 }}>New Project</h3>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required placeholder="Project name" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={2} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="form-input" style={{ padding: 3, height: 36, width: 52 }} value={newProjectColor} onChange={e => setNewProjectColor(e.target.value)} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{newProjectColor}</span>
                </div>
              </div>
              <button className="btn btn-primary w-full" style={{ marginTop: 4 }}><Plus size={13} /> Create</button>
            </form>
          </div>

          {/* List */}
          <div className="card card-sm">
            <h3 style={{ fontSize: '0.875rem', marginBottom: 16 }}>{projects.length} Projects</h3>
            <div>
              {projects.map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 8px ${p.color}66` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>{p.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {activeTab === 'users' && (
        <div className="card card-sm" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', margin: 0 }}>All Users</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{users.length} members</span>
          </div>
          {users.map(u => (
            <div key={u._id} className="user-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="avatar">{u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
                    {u.name}
                    <span className={`badge badge-${u.role}`} style={{ marginLeft: 8 }}>{u.role}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>{u.email}</div>
                </div>
              </div>
              {u.role !== 'admin' && (
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => promoteUser(u._id)}>
                    <ArrowUp size={12} /> Promote
                  </button>
                  <button className="btn btn-icon btn-danger-ghost btn-sm" onClick={() => deleteUser(u._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
              {u.role === 'admin' && u._id !== currentUser?._id && (
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => demoteUser(u._id)}>
                    <ArrowDown size={12} /> Demote
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
