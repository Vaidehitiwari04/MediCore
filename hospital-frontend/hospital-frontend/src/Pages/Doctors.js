import React, { useEffect, useState } from 'react';
import { Stethoscope, Search, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Loader from '../components/Loader';
import { getHospitalData } from '../api/api';
import './ListPage.css';

const SPEC_COLORS = {
  'Cardiology':       'var(--accent-red)',
  'Neurology':        'var(--accent-blue)',
  'Orthopedics':      'var(--accent-gold)',
  'Pediatrics':       'var(--accent-emerald)',
  'Oncology':         '#b06aff',
  'Radiology':        'var(--accent-cyan)',
  'General Medicine': 'var(--accent-teal)',
  'Surgery':          '#ff8c42',
};

export default function Doctors() {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filterSpec, setFilterSpec] = useState('');

  const load = () => {
    setLoading(true); setError(null);
    getHospitalData()
      .then(r => setDoctors(r.data.doctors || []))
      .catch(() => setError('Failed to load doctors. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filtered = doctors.filter(d => {
    const matchSearch = d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
                        String(d.doctorId).includes(search);
    const matchSpec   = filterSpec ? d.specialization === filterSpec : true;
    return matchSearch && matchSpec;
  });

  return (
    <div className="page">
      <Header title="Doctors" subtitle={`${doctors.length} registered doctors`} />
      <div className="page-content">

        <div className="list-toolbar animate-fade-up">
          <div className="toolbar-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
            <option value="">All Specializations</option>
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/add-doctor" className="btn btn-primary">
              <Plus size={14} /> Add Doctor
            </Link>
          </div>
        </div>

        {loading && <Loader />}
        {error   && <div className="error-banner">{error}</div>}

        {!loading && !error && (
          <>
            <div className="count-bar animate-fade-up">
              Showing <strong>{filtered.length}</strong> of <strong>{doctors.length}</strong> doctors
            </div>

            {filtered.length === 0 ? (
              <div className="empty-page">
                <Stethoscope size={48} />
                <h3>No doctors found</h3>
                <p>{search || filterSpec ? 'Try a different filter.' : 'Add your first doctor to get started.'}</p>
              </div>
            ) : (
              <div className="cards-grid animate-fade-up">
                {filtered.map((d, i) => {
                  const color = SPEC_COLORS[d.specialization] || 'var(--accent-cyan)';
                  return (
                    <div key={d.doctorId} className="doctor-card" style={{ '--dc': color, animationDelay: `${i * 0.05}s` }}>
                      <div className="dc-top">
                        <div className="dc-avatar">{d.doctorName?.charAt(0).toUpperCase()}</div>
                        <div className="dc-badge">{d.specialization}</div>
                      </div>
                      <div className="dc-name">Dr. {d.doctorName}</div>
                      <div className="dc-id">ID: {d.doctorId}</div>
                      <div className="dc-bar" />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}