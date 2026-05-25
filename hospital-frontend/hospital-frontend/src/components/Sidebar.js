import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Plus,
  Heart, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/',            icon: LayoutDashboard, label: 'Dashboard',   exact: true },
  { path: '/patients',    icon: Users,           label: 'Patients'   },
  { path: '/doctors',     icon: Stethoscope,     label: 'Doctors'    },
  { path: '/add-patient', icon: Plus,            label: 'Add Patient' },
  { path: '/add-doctor',  icon: Plus,            label: 'Add Doctor'  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon"><Heart size={20} strokeWidth={2.5} /></div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">MediCore</span>
            <span className="logo-sub">Hospital System</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="sidebar-live">
          <Activity size={12} />
          <span>System Online</span>
          <span className="live-dot" />
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="nav-label">{!collapsed && 'NAVIGATION'}</div>
        {navItems.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><Icon size={18} /></span>
            {!collapsed && <span className="nav-label-text">{label}</span>}
            {!collapsed && <span className="nav-arrow">›</span>}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed
          ? <ChevronRight size={16} />
          : <><ChevronLeft size={16} /><span>Collapse</span></>
        }
      </button>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-version">v1.0.0</div>
          <div className="footer-copy">© 2026 MediCore</div>
        </div>
      )}
    </aside>
  );
}