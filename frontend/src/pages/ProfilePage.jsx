import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Lock, Shield, Mail, Edit3, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

/* ── Avatar with initials ── */
function BigAvatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#7c6fef','#3b82f6','#22c55e','#f59e0b','#f43f5e','#8b5cf6','#06b6d4'];
  const color  = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.6rem', fontWeight: 700, color,
      flexShrink: 0, transition: 'all 0.3s ease',
    }}>
      {initials}
    </div>
  );
}

/* ── Password visibility toggle input ── */
function PasswordInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: 38 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  /* profile form state */
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);

  /* password form state */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return toast.error('Name and email are required');
    setProfileSaving(true);
    try {
      const { data } = await api.patch('/users/me/profile', { name, email });
      updateUser(data.user);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) return toast.error('New passwords do not match');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await api.patch('/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? format(parseISO(user.createdAt), 'MMMM yyyy')
    : null;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* ── Header ── */}
      <div className="page-header fade-up" style={{ paddingTop: 0, marginBottom: 32 }}>
        <div className="flex items-center gap-4">
          <BigAvatar name={user?.name} />
          <div>
            <h1 className="page-title gradient-text">{user?.name}</h1>
            <p className="page-subtitle" style={{ marginTop: 4 }}>{user?.email}</p>
            <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              {memberSince && (
                <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  <Calendar size={11} /> Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Profile Info Card ── */}
        <div className="card fade-up-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent-glow)', border: '1px solid rgba(124,111,239,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', margin: 0 }}>Personal Information</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>Update your name and email address</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="profile-email">
                  <span className="flex items-center gap-1"><Mail size={10} /> Email Address</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {profileSaved && (
                <span className="flex items-center gap-1 fade-up" style={{ fontSize: '0.82rem', color: 'var(--success)' }}>
                  <CheckCircle size={13} /> Saved
                </span>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileSaving}
                style={{ minWidth: 120 }}
              >
                <Edit3 size={13} />
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div className="card fade-up-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={15} style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', margin: 0 }}>Change Password</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>Use a strong password — at least 6 characters</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="current-pw">Current Password</label>
                <PasswordInput id="current-pw" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="new-pw">New Password</label>
                  <PasswordInput id="new-pw" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                  <PasswordInput id="confirm-pw" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                </div>
              </div>

              {/* Password strength bar */}
              {newPw && (
                <div className="fade-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Password strength</span>
                    <span style={{ fontSize: '0.72rem', color: strengthColor(newPw) }}>{strengthLabel(newPw)}</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ marginTop: 0 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${strengthPct(newPw)}%`,
                      background: strengthColor(newPw),
                    }} />
                  </div>
                </div>
              )}

              {/* Match indicator */}
              {confirmPw && (
                <div className="flex items-center gap-1 fade-up" style={{
                  fontSize: '0.78rem',
                  color: newPw === confirmPw ? 'var(--success)' : 'var(--danger)',
                }}>
                  <CheckCircle size={12} />
                  {newPw === confirmPw ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <div className="flex justify-end" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button type="submit" className="btn btn-primary" disabled={pwSaving} style={{ minWidth: 140 }}>
                <Lock size={13} />
                {pwSaving ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Account Info Card ── */}
        <div className="card fade-up-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={15} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', margin: 0 }}>Account Details</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>Read-only account information</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'User ID',      value: user?._id?.slice(-8).toUpperCase(), mono: true },
              { label: 'Role',         value: user?.role,  cap: true },
              { label: 'Member Since', value: memberSince || '—' },
            ].map(({ label, value, mono, cap }) => (
              <div key={label} style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
              }}>
                <div className="meta-field-label">{label}</div>
                <div style={{
                  fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500,
                  fontFamily: mono ? 'monospace' : 'inherit',
                  textTransform: cap ? 'capitalize' : 'none',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Password strength helpers ── */
function strengthPct(pw) {
  let s = 0;
  if (pw.length >= 6)  s += 25;
  if (pw.length >= 10) s += 25;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 25;
  if (/[0-9!@#$%^&*]/.test(pw)) s += 25;
  return s;
}
function strengthLabel(pw) {
  const p = strengthPct(pw);
  if (p <= 25) return 'Weak';
  if (p <= 50) return 'Fair';
  if (p <= 75) return 'Good';
  return 'Strong';
}
function strengthColor(pw) {
  const p = strengthPct(pw);
  if (p <= 25) return 'var(--danger)';
  if (p <= 50) return 'var(--warning)';
  if (p <= 75) return 'var(--info)';
  return 'var(--success)';
}
