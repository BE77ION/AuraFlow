import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, FolderKanban, ShieldCheck, LogOut, Sun, Moon, UserCircle } from 'lucide-react';

function SidebarClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="live-clock">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      <span style={{ opacity: 0.5, marginLeft: 6 }}>
        {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <span className="sidebar-brand-dot" />
          </div>
          <span className="sidebar-brand-name">AuraFlow</span>
        </div>

        <SidebarClock />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menu</span>
          <NavLink to="/" end className={({ isActive }) => `sidebar-link fade-up-1 ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `sidebar-link fade-up-2 ${isActive ? 'active' : ''}`}>
            <FolderKanban size={16} /><span>Projects</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link fade-up-3 ${isActive ? 'active' : ''}`}>
            <UserCircle size={16} /><span>Profile</span>
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <span className="sidebar-nav-label" style={{ marginTop: 12 }}>Admin</span>
              <NavLink to="/admin" className={({ isActive }) => `sidebar-link sidebar-link-admin fade-up-4 ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={16} /><span>Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: '0 12px 8px' }}>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <div className="theme-toggle-track">
              <span className="theme-toggle-icon theme-toggle-icon-sun"><Sun size={11} /></span>
              <span className="theme-toggle-icon theme-toggle-icon-moon"><Moon size={11} /></span>
              <span className="theme-toggle-thumb" />
            </div>
            <span className="theme-toggle-label">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          </button>
        </div>

        {/* User footer — click avatar to go to profile */}
        <div className="sidebar-footer">
          <button
            className="sidebar-user"
            onClick={() => navigate('/profile')}
            title="View profile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            <div className="avatar" style={{ transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </button>
          <button className="sidebar-logout" onClick={logout} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
