import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, X, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { isPast, parseISO, format } from 'date-fns';

const COLS = [
  { key: 'todo',        label: 'To Do',       color: '#60607a' },
  { key: 'in_progress', label: 'In Progress',  color: '#3b82f6' },
  { key: 'review',      label: 'Review',       color: '#f59e0b' },
  { key: 'done',        label: 'Done',         color: '#22c55e' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'medium' });

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/tasks?projectId=${id}`), api.get('/users')])
      .then(([p, t, u]) => { setProject(p.data); setTasks(t.data); setUsers(u.data); })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tasks', { ...form, projectId: id });
      setTasks([data, ...tasks]);
      setShowModal(false);
      setForm({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'medium' });
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (loading || !project) return <div className="loading-screen">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects" className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-3)', textDecoration: 'none', marginBottom: 10, display: 'inline-flex' }}>
            <ArrowLeft size={12} /> Projects
          </Link>
          <h1 className="flex items-center gap-2 page-title">
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: project.color, display: 'inline-block', boxShadow: `0 0 10px ${project.color}66` }} />
            {project.name}
          </h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-dot" style={{ background: col.color, boxShadow: `0 0 6px ${col.color}88` }} />
                <span className="kanban-col-title">{col.label}</span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>

              {colTasks.map(task => {
                const isOvd = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));
                return (
                  <Link to={`/task/${task._id}`} key={task._id} className="kanban-task" style={isOvd ? { borderColor: 'rgba(244,63,94,0.3)' } : {}}>
                    <div className="kanban-task-title">{task.title}</div>
                    <div className="kanban-task-meta">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span style={{ fontSize: '0.72rem', color: isOvd ? 'var(--danger)' : 'var(--text-3)' }}>
                            {format(parseISO(task.dueDate), 'MMM d')}
                          </span>
                        )}
                        {task.assigneeId && (
                          <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.6rem' }}>
                            {task.assigneeId.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {colTasks.length === 0 && <div className="kanban-empty">No tasks</div>}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>New Task</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required autoFocus placeholder="Task title…" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required placeholder="Describe the task…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select className="form-input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
