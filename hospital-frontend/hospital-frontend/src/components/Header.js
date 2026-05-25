import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

export default function Header({ title, subtitle }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-time">
          <span className="time-val">{timeStr}</span>
          <span className="date-val">{dateStr}</span>
        </div>
        <div className="header-search">
          <Search size={15} className="search-icon" />
          <input type="text" placeholder="Search records…" />
        </div>
        <button className="header-btn notify-btn">
          <Bell size={18} />
          <span className="notify-badge">3</span>
        </button>
        <div className="header-avatar">
          <User size={16} />
          <div className="avatar-info">
            <span className="avatar-name">Admin</span>
            <span className="avatar-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}