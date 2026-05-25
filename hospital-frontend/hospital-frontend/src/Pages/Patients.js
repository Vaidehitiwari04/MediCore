import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Loader from '../components/Loader';
import { getPatients } from '../api/api';
import './ListPage.css';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true); setError(null);
    getPatients()
      .then(r => setPatients(r.data))
      .catch(() => setError('Failed to load patients. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.patientId).includes(search)
  );

  return (
    <div className="page">
      <Header title="Patients" subtitle={`${patients.length} registered patients`} />
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
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/add-patient" className="btn btn-primary">
              <Plus size={14} /> Add Patient
            </Link>
          </div>
        </div>

        {loading && <Loader />}
        {error   && <div className="error-banner">{error}</div>}

        {!loading && !error && (
          <>
            <div className="count-bar animate-fade-up">
              Showing <strong>{filtered.length}</strong> of <strong>{patients.length}</strong> patients
            </div>

            {filtered.length === 0 ? (
              <div className="empty-page">
                <Users size={48} />
                <h3>No patients found</h3>
                <p>{search ? 'Try a different search.' : 'Add your first patient to get started.'}</p>
                {!search && <Link to="/add-patient" className="btn btn-primary">Add Patient</Link>}
              </div>
            ) : (
              <div className="table-wrap animate-fade-up">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Patient</th>
                      <th>Patient ID</th>
                      <th>Disease</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.patientId} style={{ animationDelay: `${i * 0.03}s` }}>
                        <td className="td-num">{i + 1}</td>
                        <td>
                          <div className="cell-person">
                            <div className="cell-avatar patient-av">{p.name?.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="cell-name">{p.name}</div>
                              <div className="cell-sub">Patient</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="id-chip">#{p.patientId}</span></td>
                        <td><span className="badge badge-cyan" style={{ textTransform: 'none' }}>{p.disease || 'N/A'}</span></td>
                        <td>
                          <span className="badge badge-emerald">
                            <span className="dot" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}