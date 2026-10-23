import React, { useState, useEffect } from 'react';

// API base URL: defaults to localhost:5000 or same origin in production
// Leave this empty for local development and production builds. Relative API
// URLs work with the Vite proxy in development and Express's static hosting
// in production. Set VITE_API_BASE only when the API is hosted separately.
const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
  const [activeTab, setActiveTab] = useState('operations');
  const [stats, setStats] = useState({
    critical: 0, dispatched: 0, resolved: 0, avgResp: 0, availAmb: 0, onDuty: 0, pending: 0, activeCount: 0
  });
  const [incidents, setIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [responders, setResponders] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [triage, setTriage] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [tagSummary, setTagSummary] = useState([]);

  // Selected incident for supplementary notes & attachments
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentNotes, setIncidentNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('Critical, Triage');
  const [notePriority, setNotePriority] = useState('Urgent');

  // New incident modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [formData, setFormData] = useState({
    caller: '',
    phone: '',
    type: 'Cardiac Arrest',
    severity: 'Critical',
    address: '',
    description: '',
    ambulanceId: '',
    responderId: ''
  });
  const [formError, setFormError] = useState('');

  // Authentication state (Unit 6)
  const [token, setToken] = useState(localStorage.getItem('ems_token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ username: '', email: '', password: '', role: 'dispatcher' });
  const [authError, setAuthError] = useState('');

  // Loading & refresh
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all core operational data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [
        statsRes,
        incRes,
        allIncRes,
        ambRes,
        respRes,
        dispRes,
        hospRes,
        triageRes,
        eqRes,
        histRes,
        tagRes
      ] = await Promise.all([
        fetch(`${API_BASE}/api/stats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/incidents`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/incidents/all`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/ambulances`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/responders`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/dispatches`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/hospitals`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/triage`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/equipment`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/history`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/tags/summary`).then(r => r.json()).catch(() => [])
      ]);

      if (statsRes.critical !== undefined) setStats(statsRes);
      if (Array.isArray(incRes)) setIncidents(incRes);
      if (Array.isArray(allIncRes)) setAllIncidents(allIncRes);
      if (Array.isArray(ambRes)) setAmbulances(ambRes);
      if (Array.isArray(respRes)) setResponders(respRes);
      if (Array.isArray(dispRes)) setDispatches(dispRes);
      if (Array.isArray(hospRes)) setHospitals(hospRes);
      if (Array.isArray(triageRes)) setTriage(triageRes);
      if (Array.isArray(eqRes)) setEquipment(eqRes);
      if (Array.isArray(histRes)) setAuditLog(histRes);
      if (Array.isArray(tagRes)) setTagSummary(tagRes);
    } catch (err) {
      console.error('Data sync failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user if token present
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
        else {
          setToken('');
          localStorage.removeItem('ems_token');
        }
      })
      .catch(() => {
        setToken('');
        localStorage.removeItem('ems_token');
      });
  }, [token]);

  // Fetch incident notes when incident selected
  useEffect(() => {
    if (!selectedIncident) return;
    fetch(`${API_BASE}/api/incidents/${selectedIncident.rawId}/notes`)
      .then(r => r.json())
      .then(d => setIncidentNotes(Array.isArray(d) ? d : []))
      .catch(() => setIncidentNotes([]));
  }, [selectedIncident]);

  // Direct quick dispatch
  const handleQuickDispatch = async (incidentId, ambulanceId, responderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quickDispatch: true,
          incidentId,
          ambulanceId,
          responderId: responderId || null
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      alert('Dispatch failed: ' + err.message);
    }
  };

  // Advance dispatch lifecycle status
  const handleStatusProgression = async (dispatchId, currentStatus) => {
    let nextStatus = 'En Route';
    if (currentStatus === 'Dispatched') nextStatus = 'En Route';
    else if (currentStatus === 'En Route') nextStatus = 'At Scene';
    else if (currentStatus === 'At Scene') nextStatus = 'Completed';

    try {
      const res = await fetch(`${API_BASE}/api/dispatches/${dispatchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Submit new emergency incident form with native validation & sanitization
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Native & RegExp validation check (Unit 3)
    const phoneRegex = /^[0-9+\s-]{7,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError('Please enter a valid phone number (digits and dashes only).');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Emergency location address is mandatory.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowReportModal(false);
        setFormData({
          caller: '',
          phone: '',
          type: 'Cardiac Arrest',
          severity: 'Critical',
          address: '',
          description: '',
          ambulanceId: '',
          responderId: ''
        });
        await fetchData();
      } else {
        setFormError(data.error || 'Failed to submit incident.');
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Add MongoDB Note to incident
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedIncident) return;
    try {
      const tagsArray = newNoteTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/incidents/${selectedIncident.rawId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newNoteText,
          author: user ? user.username : 'Dispatcher Console',
          tags: tagsArray,
          priority: notePriority,
          dispatchSummary: {
            ambulanceAssigned: ambulances.find(a => a.status === 'Available')?.no || 'AMB-Auto',
            estimatedArrivalMin: 5,
            hospitalNotified: true,
            primaryParamedic: 'Field Paramedic'
          }
        })
      });
      if (res.ok) {
        setNewNoteText('');
        const updated = await fetch(`${API_BASE}/api/incidents/${selectedIncident.rawId}/notes`).then(r => r.json());
        setIncidentNotes(updated);
        const tagsRes = await fetch(`${API_BASE}/api/tags/summary`).then(r => r.json());
        setTagSummary(tagsRes);
      }
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    }
  };

  // Handle Auth login/register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('ems_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_token');
    setToken('');
    setUser(null);
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', color: '#FFFFFF' }}>
      {/* ── TOP BAR (Apple Design Translucent Monochrome Chrome) ── */}
      <header className="glass-chrome" style={{
        position: 'sticky', top: 0, zIndex: 100, height: 62, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: '#FFFFFF', color: '#000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700,
            boxShadow: '0 2px 10px rgba(255, 255, 255, 0.25)'
          }}>
            🚨
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 600 }}>Emergency Dispatch</h1>
              <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>SIU FSD</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>
              Healthcare Response System · MySQL & MongoDB Unified
            </div>
          </div>
        </div>

        {/* Center Live Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            background: '#0A0A0A', border: '1px solid var(--glass-border)'
          }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>OPERATIONAL</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>|</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{currentTime}</span>
          </div>

          <button
            onClick={fetchData}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            title="Refresh Operational Data"
          >
            🔄 <span style={{ fontSize: '0.75rem' }}>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Right Action / Auth Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="apple-btn apple-btn-primary"
          >
            ➕ New Incident
          </button>

          {user ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              background: '#0A0A0A', border: '1px solid var(--glass-border)'
            }}>
              <span style={{ fontSize: '1rem' }}>🛡️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>{user.username}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} title="Sign Out">
                🚪
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="apple-btn apple-btn-secondary"
            >
              👤 Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── NAVIGATION TABS (Segmented Apple Controls with Apple Emojis) ── */}
      <nav style={{
        background: '#050505', borderBottom: '1px solid var(--glass-border)',
        padding: '8px 24px', display: 'flex', gap: 6, overflowX: 'auto'
      }}>
        {[
          { id: 'operations', label: 'Command Operations', emoji: '⚡', badge: stats.critical > 0 ? stats.critical : null },
          { id: 'incidents', label: 'All Incidents', emoji: '🚨', count: allIncidents.length },
          { id: 'fleet', label: 'Ambulances', emoji: '🚑', count: ambulances.length },
          { id: 'facilities', label: 'Hospitals & Responders', emoji: '🏥' },
          { id: 'clinical', label: 'Triage & Equipment', emoji: '🩺' },
          { id: 'notes', label: 'Dynamic Notes & Tags (NoSQL)', emoji: '📋', badge: 'MongoDB' },
          { id: 'audit', label: 'Audit Trail', emoji: '⏱️' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="apple-btn"
              style={{
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#000000' : 'var(--text-secondary)',
                border: isActive ? '1px solid #FFFFFF' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 500
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="badge badge-critical" style={{
                  fontSize: '0.65rem', padding: '1px 6px',
                  background: isActive ? '#000000' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#000000'
                }}>
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  color: isActive ? '#000000' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
                  padding: '1px 6px',
                  borderRadius: 4
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="layout-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* KPI CARDS (Strictly Black & White) */}
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14
        }}>
          {[
            { label: 'Critical Emergencies', emoji: '🚨', value: stats.critical, sub: 'Immediate response needed' },
            { label: 'In-Flight Dispatches', emoji: '🚑', value: stats.dispatched, sub: 'Units actively responding' },
            { label: 'Avg Response Time', emoji: '⏱️', value: `${Number(stats.avgResp || 0).toFixed(1)}m`, sub: 'Dispatched to scene' },
            { label: 'Ambulances Ready', emoji: '✅', value: stats.availAmb, sub: 'Fleet availability' },
            { label: 'Responders On Duty', emoji: '🧑‍⚕️', value: stats.onDuty, sub: 'EMTs, Paramedics, MDs' },
            { label: 'Resolved Today', emoji: '📋', value: stats.resolved, sub: 'Incidents handled' }
          ].map((card, idx) => (
            <article key={idx} className="glass-panel" style={{ padding: '16px 18px', background: '#0A0A0A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="micro-label">{card.label}</span>
                <span style={{ fontSize: '1.1rem' }}>{card.emoji}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: '#FFFFFF', margin: '4px 0', letterSpacing: '-0.03em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{card.sub}</div>
            </article>
          ))}
        </section>

        {/* ── TAB 1: COMMAND OPERATIONS ── */}
        {activeTab === 'operations' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.3fr) minmax(300px, 1fr)', gap: 20 }}>
            {/* Active Incidents Stream */}
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2>Active Emergency Incidents</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority sorted by triage severity (MySQL)</p>
                </div>
                <span className="badge badge-critical">{incidents.length} Active</span>
              </div>

              {incidents.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
                  <div>No pending emergencies. All active units standing by.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {incidents.map(inc => {
                    const isCrit = inc.severity === 'Critical';
                    const availAmbs = ambulances.filter(a => a.status === 'Available');

                    return (
                      <article
                        key={inc.id}
                        className="glass-panel"
                        style={{
                          padding: 16,
                          background: isCrit ? '#141414' : '#0F0F0F',
                          borderColor: isCrit ? '#FFFFFF' : 'var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: '#FFFFFF' }}>{inc.id}</span>
                            <span className={`badge ${isCrit ? 'badge-critical' : 'badge-high'}`}>{inc.severity}</span>
                            <span className="badge badge-secondary">{inc.type}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{inc.time}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#FFFFFF', marginBottom: 4 }}>
                          <span>📍</span>
                          <strong>{inc.location}</strong>
                        </div>

                        {inc.desc && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{inc.desc}</p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            👤 Caller: {inc.caller} (📞 {inc.phone})
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => { setSelectedIncident(inc); setActiveTab('notes'); }}
                              className="apple-btn apple-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              📝 Notes
                            </button>

                            {inc.status === 'Pending' && availAmbs.length > 0 && (
                              <button
                                onClick={() => handleQuickDispatch(inc.rawId, availAmbs[0].id, responders.find(r => r.status === 'Available')?.id)}
                                className="apple-btn apple-btn-primary"
                                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                              >
                                🚑 Dispatch {availAmbs[0].no}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Live Dispatch Log & Status Progression */}
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <div style={{ marginBottom: 16 }}>
                <h2>Live Unit Dispatches</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lifecycle status & response timing</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dispatches.map(disp => (
                  <article key={disp.id} className="glass-panel" style={{ padding: 14, background: '#0F0F0F' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#FFFFFF' }}>{disp.id}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>→ {disp.incident}</span>
                      </div>
                      <span className={`badge ${disp.status === 'Completed' ? 'badge-secondary' : 'badge-critical'}`}>{disp.status}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      <div>🚑 <strong>{disp.amb}</strong> · Crew: {disp.responder}</div>
                      <div>⏱️ {disp.respMin !== '—' ? `${disp.respMin} min` : 'Calculating'}</div>
                    </div>

                    {disp.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusProgression(disp.rawId, disp.status)}
                        className="apple-btn apple-btn-secondary"
                        style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }}
                      >
                        Advance to: {disp.status === 'Dispatched' ? '🚑 En Route' : disp.status === 'En Route' ? '📍 At Scene' : '✅ Completed'}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 2: ALL INCIDENTS ── */}
        {activeTab === 'incidents' && (
          <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2>Complete Incident Database</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historic and resolved records from MySQL</p>
              </div>
              <button onClick={() => setShowReportModal(true)} className="apple-btn apple-btn-primary">
                ➕ Report Emergency
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                    <th style={{ padding: '10px 14px' }}>ID</th>
                    <th style={{ padding: '10px 14px' }}>Type</th>
                    <th style={{ padding: '10px 14px' }}>Severity</th>
                    <th style={{ padding: '10px 14px' }}>Location</th>
                    <th style={{ padding: '10px 14px' }}>Caller</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allIncidents.map(inc => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>{inc.id}</td>
                      <td style={{ padding: '12px 14px' }}>{inc.type}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${inc.severity === 'Critical' ? 'badge-critical' : 'badge-secondary'}`}>{inc.severity}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>{inc.location}</td>
                      <td style={{ padding: '12px 14px' }}>{inc.caller} ({inc.phone})</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-secondary">{inc.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => { setSelectedIncident(inc); setActiveTab('notes'); }}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          📝 Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── TAB 3: AMBULANCE FLEET ── */}
        {activeTab === 'fleet' && (
          <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
            <div style={{ marginBottom: 16 }}>
              <h2>Ambulance Fleet Status</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicle status, telemetry & classification</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {ambulances.map(amb => (
                <article key={amb.id} className="glass-panel" style={{ padding: 18, background: '#0F0F0F' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF', color: '#000000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                      }}>
                        🚑
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>{amb.no}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{amb.type} Class</span>
                      </div>
                    </div>
                    <span className={`badge ${amb.status === 'Available' ? 'badge-critical' : 'badge-secondary'}`}>{amb.status}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>📍 Coordinates: {amb.lat || '18.5204'}, {amb.lng || '73.8567'}</div>
                    <div>📡 Telemetry Sync: {amb.updated ? new Date(amb.updated).toLocaleTimeString() : 'Live'}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 4: HOSPITALS & RESPONDERS ── */}
        {activeTab === 'facilities' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <h2 style={{ marginBottom: 14 }}>Hospital Emergency Network</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hospitals.map(h => (
                  <article key={h.id} className="glass-panel" style={{ padding: 16, background: '#0F0F0F' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>🏥</span>
                        <strong style={{ color: '#FFFFFF' }}>{h.name}</strong>
                      </div>
                      {h.trauma && <span className="badge badge-critical">Trauma Center Level 1</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      📍 {h.address} · Zone: {h.zone}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#FFFFFF' }}>
                      <div>🛏️ Available Beds: <strong>{h.availBeds}</strong> / {h.totalBeds}</div>
                      <div>📞 {h.phone}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <h2 style={{ marginBottom: 14 }}>EMS Responders on Duty</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {responders.map(r => (
                  <div key={r.id} className="glass-panel" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F0F0F' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#FFFFFF' }}>🧑‍⚕️ {r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.role} · 📞 {r.phone}</div>
                    </div>
                    <span className={`badge ${r.status === 'Available' ? 'badge-critical' : 'badge-secondary'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 5: TRIAGE & EQUIPMENT ── */}
        {activeTab === 'clinical' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <h2 style={{ marginBottom: 14 }}>Active Triage Records</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {triage.map(t => (
                  <article key={t.id} className="glass-panel" style={{ padding: 16, background: '#0F0F0F' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>🩺</span>
                        <strong style={{ color: '#FFFFFF' }}>{t.patient}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>🫀 Vitals: {t.vitals}</span>
                      <span>📝 Notes: {t.notes}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <h2 style={{ marginBottom: 14 }}>Emergency Equipment</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {equipment.map(e => (
                  <div key={e.id} className="glass-panel" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F0F0F' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#FFFFFF' }}>📦 {e.item}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Category: {e.category} · Assigned: {e.vehicle}</div>
                    </div>
                    <span className="badge badge-secondary">{e.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 6: DYNAMIC NOTES & TAGS (MongoDB) ── */}
        {activeTab === 'notes' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <div style={{ marginBottom: 16 }}>
                <h2>Paramedic Clinical Notes (MongoDB)</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Unit 4: Supplementary Unstructured Field Telemetry
                </p>
              </div>

              {/* Incident Selector */}
              <div style={{ marginBottom: 14 }}>
                <label className="micro-label">Select Incident to View Notes</label>
                <select
                  className="apple-select"
                  value={selectedIncident ? selectedIncident.rawId : ''}
                  onChange={(e) => {
                    const sel = allIncidents.find(i => String(i.rawId) === e.target.value);
                    setSelectedIncident(sel || null);
                  }}
                >
                  <option value="">Select an incident to view notes...</option>
                  {allIncidents.map(i => (
                    <option key={i.id} value={i.rawId}>{i.id} - {i.type} ({i.location})</option>
                  ))}
                </select>
              </div>

              {/* Add Note Form */}
              {selectedIncident && (
                <form onSubmit={handleAddNote} className="glass-panel" style={{ padding: 14, marginBottom: 20, background: '#0F0F0F' }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: 10, color: '#FFFFFF' }}>Add Supplementary Paramedic Note</h3>
                  <textarea
                    className="apple-textarea"
                    rows={2}
                    placeholder="Enter clinical or field operational details..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 10 }}>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="Tags (e.g. Cardiac, Priority-1)"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                    />
                    <select
                      className="apple-select"
                      value={notePriority}
                      onChange={(e) => setNotePriority(e.target.value)}
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <button type="submit" className="apple-btn apple-btn-primary">
                      📨 Add Note
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {incidentNotes.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No supplementary notes found for this incident. Add one above!
                  </div>
                ) : (
                  incidentNotes.map((n, i) => (
                    <article key={i} className="glass-panel" style={{ padding: 14, background: '#0F0F0F' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <strong style={{ color: '#FFFFFF' }}>🧑‍⚕️ {n.author}</strong>
                          <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{n.priority}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: 8 }}>{n.note}</p>
                      {n.tags && n.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {n.tags.map((t, idx) => (
                            <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>🏷️ #{t}</span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* MongoDB Aggregation Pipeline Showcase */}
            <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
              <div style={{ marginBottom: 16 }}>
                <h2>MongoDB Aggregation Pipeline</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Unit 4: <code>$unwind → $group → $sort</code>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tagSummary.map((ts, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F0F0F' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>🏷️</span>
                      <strong style={{ color: '#FFFFFF' }}>#{ts.tag}</strong>
                    </div>
                    <span className="badge badge-critical">{ts.count} Hits</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 7: AUDIT TRAIL ── */}
        {activeTab === 'audit' && (
          <section className="glass-panel" style={{ padding: 20, background: '#0A0A0A' }}>
            <div style={{ marginBottom: 16 }}>
              <h2>Automated Database Audit Trail</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Generated in real time by MySQL Triggers (<code>trg_incidents_insert</code>, <code>trg_dispatch_insert</code>)
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                    <th style={{ padding: '10px 14px' }}>Log ID</th>
                    <th style={{ padding: '10px 14px' }}>Table</th>
                    <th style={{ padding: '10px 14px' }}>Record ID</th>
                    <th style={{ padding: '10px 14px' }}>Action</th>
                    <th style={{ padding: '10px 14px' }}>Author</th>
                    <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>#{log.id}</td>
                      <td style={{ padding: '10px 14px' }}><code>{log.table}</code></td>
                      <td style={{ padding: '10px 14px' }}>{log.recordId}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${log.action === 'INSERT' ? 'badge-critical' : 'badge-secondary'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{log.by}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* ── MODAL: REPORT NEW EMERGENCY ── */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 540, padding: 24, background: '#0A0A0A',
            border: '1px solid #FFFFFF',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Emergency Incident Report</h2>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#FFFFFF',
                color: '#000000', fontWeight: 600, marginBottom: 14, fontSize: '0.85rem'
              }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="micro-label">Caller Name *</label>
                  <input
                    type="text"
                    required
                    className="apple-input"
                    placeholder="e.g. John Doe"
                    value={formData.caller}
                    onChange={e => setFormData({ ...formData, caller: e.target.value })}
                  />
                </div>
                <div>
                  <label className="micro-label">Caller Phone *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9+\s-]{7,15}"
                    className="apple-input"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="micro-label">Incident Type *</label>
                  <select
                    className="apple-select"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Cardiac Arrest">Cardiac Arrest</option>
                    <option value="Trauma">Trauma</option>
                    <option value="Road Accident">Road Accident</option>
                    <option value="Stroke">Stroke</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Fire Injury">Fire Injury</option>
                    <option value="Poisoning">Poisoning</option>
                    <option value="Maternity">Maternity</option>
                  </select>
                </div>
                <div>
                  <label className="micro-label">Severity Level *</label>
                  <select
                    className="apple-select"
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="Critical">Critical (P1 - Immediate)</option>
                    <option value="High">High (P2 - Delayed)</option>
                    <option value="Medium">Medium (P3 - Minimal)</option>
                    <option value="Low">Low (Non-urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="micro-label">Incident Address / Location *</label>
                <input
                  type="text"
                  required
                  className="apple-input"
                  placeholder="e.g. Landmark, Street, Zone"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="micro-label">Operational Description</label>
                <textarea
                  className="apple-textarea"
                  rows={2}
                  placeholder="Details of symptoms, scene conditions..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Immediate Dispatch Option */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 14 }}>
                <div className="micro-label" style={{ marginBottom: 8 }}>Auto-Dispatch Unit (Optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <select
                    className="apple-select"
                    value={formData.ambulanceId}
                    onChange={e => setFormData({ ...formData, ambulanceId: e.target.value })}
                  >
                    <option value="">No immediate unit</option>
                    {ambulances.filter(a => a.status === 'Available').map(a => (
                      <option key={a.id} value={a.id}>{a.no} ({a.type})</option>
                    ))}
                  </select>

                  <select
                    className="apple-select"
                    value={formData.responderId}
                    onChange={e => setFormData({ ...formData, responderId: e.target.value })}
                  >
                    <option value="">No responder assigned</option>
                    {responders.filter(r => r.status === 'Available').map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowReportModal(false)} className="apple-btn apple-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="apple-btn apple-btn-primary">
                  🚨 Submit & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: AUTHENTICATION ── */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: 24, background: '#0A0A0A', border: '1px solid #FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>{authMode === 'login' ? 'Operator Sign In' : 'Register Operator'}</h2>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            {authError && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#FFFFFF',
                color: '#000000', fontWeight: 600, marginBottom: 14, fontSize: '0.85rem'
              }}>
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="micro-label">Username</label>
                <input
                  type="text"
                  required
                  className="apple-input"
                  value={authData.username}
                  onChange={e => setAuthData({ ...authData, username: e.target.value })}
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="micro-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="apple-input"
                    value={authData.email}
                    onChange={e => setAuthData({ ...authData, email: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="micro-label">Password</label>
                <input
                  type="password"
                  required
                  className="apple-input"
                  value={authData.password}
                  onChange={e => setAuthData({ ...authData, password: e.target.value })}
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="micro-label">Role</label>
                  <select
                    className="apple-select"
                    value={authData.role}
                    onChange={e => setAuthData({ ...authData, role: e.target.value })}
                  >
                    <option value="dispatcher">Dispatcher</option>
                    <option value="paramedic">Paramedic</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              <button type="submit" className="apple-btn apple-btn-primary" style={{ marginTop: 8 }}>
                {authMode === 'login' ? 'Sign In to Console' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {authMode === 'login' ? (
                  <>Don't have an operator account? <a href="#register" onClick={(e) => { e.preventDefault(); setAuthMode('register'); }} style={{ color: '#FFFFFF', textDecoration: 'underline' }}>Register here</a></>
                ) : (
                  <>Already registered? <a href="#login" onClick={(e) => { e.preventDefault(); setAuthMode('login'); }} style={{ color: '#FFFFFF', textDecoration: 'underline' }}>Sign In</a></>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{
        marginTop: 'auto', borderTop: '1px solid var(--glass-border)',
        padding: '16px 24px', fontSize: '0.78rem', color: 'var(--text-tertiary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>Smart Integrated Healthcare Response & Emergency System · SIU FSD Project</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>MySQL (Authoritative)</span>
          <span>MongoDB (Dynamic Notes)</span>
          <span>Express REST API</span>
          <span>Monochrome Apple-Design</span>
        </div>
      </footer>
    </div>
  );
}
