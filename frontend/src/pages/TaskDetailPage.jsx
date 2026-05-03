import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, MessageSquare, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask]         = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/tasks/${id}`),
      api.get(`/comments/${id}`),
      api.get('/users').catch(() => ({ data: [] })),
    ])
      .then(([t, c, u]) => { setTask(t.data); setComments(c.data); setUsers(u.data); })
      .catch(() => { toast.error('Failed to load task'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateTask = async (field, value) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, { [field]: value });
      setTask(data);
      toast.success('Saved');
    } catch { toast.error('Failed to update'); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post('/comments', { text: commentText, taskId: id });
      setComments([...comments, data]);
      setCommentText('');
    } catch { toast.error('Failed to post comment'); }
  };

  const deleteTask = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      navigate(`/project/${task.projectId._id}`);
    } catch { toast.error('Failed to delete task'); }
  };

  if (loading || !task) return <div className="loading-screen">Loading…</div>;

  const isOverdue      = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));
  const isAuthorOrAdmin = user.role === 'admin' || user._id === task.authorId?._id;
  const canEditStatus  = isAuthorOrAdmin || user._id === task.assigneeId?._id;

  const accentColor = isOverdue ? 'var(--danger)' : (task.projectId?.color || 'var(--accent)');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 28 }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={13} /> Back
      </button>

      {/* Main card */}
      <div className="card" style={{ marginBottom: 16, borderTop: `2px solid ${accentColor}` }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              {task.projectId && (
                <Link to={`/project/${task.projectId._id}`} style={{ fontSize: '0.78rem', color: 'var(--text-3)', textDecoration: 'none' }}>
                  {task.projectId.name}
                </Link>
              )}
              <span style={{ color: 'var(--border-md)' }}>/</span>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              {isOverdue && <span className="badge" style={{ color: 'var(--danger)', borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)' }}>Overdue</span>}
            </div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 12, lineHeight: 1.3 }}>{task.title}</h1>
          </div>
          {isAuthorOrAdmin && (
            <button className="btn btn-icon btn-danger-ghost" onClick={deleteTask} style={{ marginLeft: 12, flexShrink: 0 }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="meta-row">
          <div>
            <div className="meta-field-label">Status</div>
            <select className="form-input" value={task.status} onChange={e => updateTask('status', e.target.value)} disabled={!canEditStatus}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <div className="meta-field-label">Assignee</div>
            <select className="form-input" value={task.assigneeId?._id || ''} onChange={e => updateTask('assigneeId', e.target.value)} disabled={!isAuthorOrAdmin}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <div className="meta-field-label">Due Date</div>
            <input
              type="date"
              className="form-input"
              style={{ color: isOverdue ? 'var(--danger)' : undefined }}
              value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
              onChange={e => updateTask('dueDate', e.target.value)}
              disabled={!isAuthorOrAdmin}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {task.description}
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <h3 className="flex items-center gap-2" style={{ marginBottom: 20 }}>
          <MessageSquare size={16} style={{ color: 'var(--text-3)' }} />
          <span>Comments</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-3)' }}>({comments.length})</span>
        </h3>

        {/* Comment list */}
        {comments.map(c => (
          <div key={c._id} className="comment">
            <div className="comment-header">
              <div className="flex items-center gap-2">
                <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>
                  {c.authorId?.name?.[0]?.toUpperCase()}
                </div>
                <span className="comment-author">{c.authorId?.name}</span>
              </div>
              <span className="comment-time">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>No comments yet.</p>
        )}

        {/* Comment form */}
        <form onSubmit={submitComment} style={{ marginTop: 16 }}>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <textarea
              className="form-input"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
              <Send size={12} /> Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
