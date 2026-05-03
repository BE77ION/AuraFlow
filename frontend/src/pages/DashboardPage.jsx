import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO, format } from 'date-fns';

/* ── Count-up hook ── */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ── Live Clock ── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="live-clock">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, count, color, delay, total }) {
  const animated = useCountUp(count, 800);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`stat-card fade-up-${delay}`} style={{ borderTop: `2px solid ${color}` }}>
      <div className="stat-label" style={{ color }}>
        {icon} {label}
      </div>
      <div className="stat-value">{animated}</div>
      {total > 0 && (
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tasks?assigneeId=${user._id}`)
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user._id]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
    </div>
  );

  const incomplete = tasks.filter(t => t.status !== 'done');
  const overdue    = incomplete.filter(t => t.dueDate && isPast(parseISO(t.dueDate)));
  const completed  = tasks.filter(t => t.status === 'done');
  const total      = tasks.length;

  const priorityColor = { urgent: 'var(--danger)', high: 'var(--warning)', medium: 'var(--text-3)', low: 'var(--text-3)' };

  return (
    <div>
      {/* Header */}
      <div className="page-header fade-up" style={{ paddingTop: 0, marginBottom: 28 }}>
        <div>
          <h1 className="page-title gradient-text">
            Good {getGreeting()}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's what's on your plate today.</p>
        </div>
        <LiveClock />
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon={<AlertCircle size={12}/>} label="Overdue"   count={overdue.length}   color="var(--danger)"  delay={1} total={total} />
        <StatCard icon={<Clock       size={12}/>} label="Pending"   count={incomplete.length} color="var(--info)"    delay={2} total={total} />
        <StatCard icon={<CheckCircle2 size={12}/>} label="Completed" count={completed.length}  color="var(--success)" delay={3} total={total} />
      </div>

      {/* Task list */}
      <div className="flex items-center justify-between fade-up-4" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-2)' }}>My Active Tasks</h2>
        <div className="flex items-center gap-2">
          <TrendingUp size={13} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{incomplete.length} tasks</span>
        </div>
      </div>

      <div className="flex-col gap-2">
        {incomplete.map((task, i) => {
          const isOvd = task.dueDate && isPast(parseISO(task.dueDate));
          return (
            <Link
              to={`/task/${task._id}`}
              key={task._id}
              className={`task-item fade-up`}
              style={{
                animationDelay: `${0.05 * i + 0.2}s`,
                borderColor: isOvd ? 'rgba(244,63,94,0.25)' : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{
                  width: 3, height: 36, borderRadius: 99,
                  background: priorityColor[task.priority] || 'var(--text-3)',
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{task.title}</div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{task.projectId?.name}</span>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {task.dueDate && (
                  <span style={{ fontSize: '0.75rem', color: isOvd ? 'var(--danger)' : 'var(--text-3)' }}>
                    {isOvd ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d')}
                  </span>
                )}
                <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
              </div>
            </Link>
          );
        })}

        {incomplete.length === 0 && (
          <div className="empty-state scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--success)', marginBottom: 10 }} />
            <div style={{ fontWeight: 500, color: 'var(--text-2)' }}>All caught up!</div>
            <div style={{ marginTop: 4 }}>No pending tasks assigned to you.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
