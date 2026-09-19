import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/departments', label: 'Departments' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const closeOnMobile = () => setOpen(false);

  return (
    <>
      <div className="mobile-topbar">
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <strong>
          EMS <span style={{ color: 'var(--brass)' }}>register</span>
        </strong>
      </div>

      {open && <div className="scrim" onClick={closeOnMobile} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          Employee <span>Register</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={closeOnMobile}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.username}</strong>
            {isAdmin ? 'Administrator' : 'Read-only access'}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
