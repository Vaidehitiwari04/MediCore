import React from 'react';
import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, color, trend, delay }) {
  return (
    <div
      className="stat-card animate-fade-up"
      style={{ animationDelay: `${delay || 0}s`, '--card-color': color }}
    >
      <div className="stat-icon"><Icon size={22} /></div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {trend && <div className="stat-trend">{trend}</div>}
      </div>
      <div className="stat-glow" />
    </div>
  );
}