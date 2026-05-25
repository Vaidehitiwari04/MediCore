import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, Activity, TrendingUp, Heart, Clock } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { getHospitalData } from '../api/api';
import './Dashboard.css';

const SPECIALIZATIONS = [
  'Cardiology','Neurology','Orthopedics','Pediatrics',
  'Oncology','Radiology','General Medicine','Surgery',
];

export default function Dashboard() {
  const [data, setData]       = useState({ patients: [], doctors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getHospitalData()
      .then(res => setData(res.data))
      .catch(() => setError('Could not reach the server. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const specMap = {};
  data.doctors.forEach(d => {
    const s = d.specialization || 'Unknown';
    specMap[s] = (specMap[s] || 0) + 1;
  });

  return (
    <div className="page">
      <Header title="Dashboard" subtitle="Welcome back — here's your hospital at a glance" />
      <div className="page-content">

        <div className="stats-grid">
          <StatCard icon={Users}      label="Total Patients"   value={loading ? '…' : data.patients.length} color="var(--accent-cyan)"    trend="↑ Active records"    delay={0}    />
          <StatCard icon={Stethoscope} label="Total Doctors"   value={loading ? '…' : data.doctors.length}  color="var(--accent-teal)"    trend="On duty today"       delay={0.05} />
          <StatCard icon={Activity}   label="Specializations"  value={loading ? '…' : Object.keys(specMap).length} color="var(--accent-blue)" trend="Departments active" delay={0.1}  />
          <StatCard icon={TrendingUp} label="Bed Occupancy"    value="74%"                                   color="var(--accent-emerald)" trend="↑ 3% this week"      delay={0.15} />
        </div>

        {loading && <Loader />}
        {error   && <div className="error-banner">{error}</div>}

        {!loading && !error && (
          <div className="dash-grid">

            {/* Recent Patients */}
            <div className="dash-card animate-fade-up stagger-1">
              <div className="dash-card-header">
                <div className="dash-card-title"><Users size={18} />Recent Patients</div>
                <span className="badge badge-cyan">{data.patients.length} total</span>
              </div>
              {data.patients.length === 0 ? (
                <div className="empty-state"><Users size={32} /><p>No patients registered yet</p></div>
              ) : (
                <div className="list-scroll">
                  {data.patients.slice(-8).reverse().map((p, i) => (
                    <div key={p.patientId} className="list-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="row-avatar patient-av">{p.name?.charAt(0).toUpperCase()}</div>
                      <div className="row-info">
                        <span className="row-name">{p.name}</span>
                        <span className="row-sub">ID: {p.patientId} | {p.disease || 'N/A'}</span>
                      </div>
                      <span className="badge badge-cyan">Patient</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctors */}
            <div className="dash-card animate-fade-up stagger-2">
              <div className="dash-card-header">
                <div className="dash-card-title"><Stethoscope size={18} />Medical Staff</div>
                <span className="badge badge-teal">{data.doctors.length} doctors</span>
              </div>
              {data.doctors.length === 0 ? (
                <div className="empty-state"><Stethoscope size={32} /><p>No doctors registered yet</p></div>
              ) : (
                <div className="list-scroll">
                  {data.doctors.slice(-8).reverse().map((d, i) => (
                    <div key={d.doctorId} className="list-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="row-avatar doctor-av">{d.doctorName?.charAt(0).toUpperCase()}</div>
                      <div className="row-info">
                        <span className="row-name">Dr. {d.doctorName}</span>
                        <span className="row-sub">{d.specialization}</span>
                      </div>
                      <span className="badge badge-teal">Doctor</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department breakdown */}
            <div className="dash-card animate-fade-up stagger-3 span-full">
              <div className="dash-card-header">
                <div className="dash-card-title"><Heart size={18} />Department Overview</div>
              </div>
              <div className="dept-grid">
                {SPECIALIZATIONS.map((s, i) => {
                  const count = specMap[s] || 0;
                  return (
                    <div key={s} className="dept-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="dept-bar-wrap">
                        <span className="dept-name">{s}</span>
                        <span className="dept-count">{count}</span>
                      </div>
                      <div className="dept-bar">
                        <div className="dept-bar-fill" style={{ width: `${Math.min(count * 25, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick info */}
            <div className="dash-card animate-fade-up stagger-4">
              <div className="dash-card-header">
                <div className="dash-card-title"><Clock size={18} />Quick Info</div>
              </div>
              <div className="info-list">
                {[
                  { label: 'Emergency Beds', val: '12 / 20' },
                  { label: 'ICU Occupied',   val: '8 / 10'  },
                  { label: 'OPD Today',      val: '47'      },
                  { label: 'Surgeries Today',val: '6'       },
                  { label: 'Avg Wait Time',  val: '18 min'  },
                ].map(({ label, val }) => (
                  <div key={label} className="info-row">
                    <span className="info-label">{label}</span>
                    <span className="info-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}