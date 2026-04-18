import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verified');
  const [scholarships, setScholarships] = useState([]);
  const [verifiedApps, setVerifiedApps] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [stats, setStats] = useState({ totalFund: 0, succRate: 0, load: 0 });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [viewingHelp, setViewingHelp] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const config = { headers: { 'Authorization': `Bearer ${user.token}` } };
    try {
      const results = await Promise.allSettled([
        axios.get('http://localhost:8080/api/student/scholarships', config),
        axios.get('http://localhost:8080/api/admin/verified', config),
        axios.get('http://localhost:8080/api/admin/help-requests', config),
        axios.get('http://localhost:8080/api/admin/all-applications', config)
      ]);
      
      if (results[0].status === 'fulfilled') setScholarships(results[0].value.data);
      if (results[1].status === 'fulfilled') setVerifiedApps(results[1].value.data.sort((a, b) => (b.finalAmount || 0) - (a.finalAmount || 0)));
      if (results[2].status === 'fulfilled') setHelpRequests(results[2].value.data);
      
      if (results[3].status === 'fulfilled') {
          const allAppRes = results[3].value;
          const approved = allAppRes.data.filter(app => app.status === 'APPROVED');
          setStats({
            totalApproved: approved.length,
            succRate: allAppRes.data.length > 0 ? Math.round((approved.length / allAppRes.data.length) * 100) : 0,
            load: results[1].status === 'fulfilled' ? results[1].value.data.length : 0
          });
      }
    } catch (e) {
      console.error("Sync Error", e);
    }
  };

  const handleHelpAction = async (status) => {
    if (!adminRemarks) { alert("Admin Remark is required for the final decision."); return; }
    try {
      await axios.post(`http://localhost:8080/api/admin/help-requests/${viewingHelp.requestId}/status`, null, {
        params: { status, remarks: adminRemarks },
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setViewingHelp(null); setAdminRemarks(''); fetchData();
    } catch (err) { alert("Operation failed"); }
  };

  const handleAppAction = async (id, status) => {
    try {
      await axios.post(`http://localhost:8080/api/admin/applications/${id}/status`, null, {
        params: { status, remarks: "Executive Authorization" },
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setViewingApp(null); fetchData();
    } catch (err) { alert("Authorization failed"); }
  };

  const deleteScholarship = async (id) => {
     if (!window.confirm("Are you sure? This will remove the scholarship authority from the system.")) return;
     try {
        await axios.delete(`http://localhost:8080/api/admin/scholarships/${id}`, {
           headers: { 'Authorization': `Bearer ${user.token}` }
        });
        fetchData();
     } catch (err) { alert("Deletion failed"); }
  };

  const handleScholarshipSubmit = async (e) => {
      e.preventDefault();
      const sData = { 
          course: e.target.course.value, 
          minPercentage: parseInt(e.target.minPercentage.value), 
          maxIncome: parseFloat(e.target.maxIncome.value), 
          baseAmount: parseFloat(e.target.baseAmount.value), 
          isDefencePriorityActive: e.target.defence.checked 
      };
      try {
          const config = { headers: { 'Authorization': `Bearer ${user.token}` } };
          if (editingScholarship) { 
              await axios.put(`http://localhost:8080/api/admin/scholarships/${editingScholarship.scholarshipId}`, sData, config); 
          } else { 
              await axios.post(`http://localhost:8080/api/admin/scholarships`, sData, config); 
          }
          setIsAdding(false); fetchData();
      } catch (err) { alert("Save failed"); }
  };

  return (
    <div style={{ padding: '80px 8%', backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <div>
           <h1 style={{ fontSize: '56px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2.5px' }}>Master Admin.</h1>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>SYSTEM AUTHORITY ACTIVE: {user.name}</p>
           </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <button onClick={fetchData} style={{ padding: '14px 28px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}>Refesh Matrix</button>
           <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '14px 28px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--danger)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = 'var(--danger)'}>Sign Out</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
         <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Total Approved</p>
            <h2 style={{ fontSize: '42px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '-1px' }}>{stats.totalApproved}</h2>
         </div>
         <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Success Ratio</p>
            <h2 style={{ fontSize: '42px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>{stats.succRate}%</h2>
         </div>
         <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Queue Load</p>
            <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#f59e0b', letterSpacing: '-1px' }}>{stats.load} <span style={{ fontSize: '16px', fontWeight: '600', opacity: 0.6 }}>Pending</span></h2>
         </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '60px', backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '18px', width: 'fit-content', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {[ {id:'verified', label:'Verified Applications'}, {id:'manage', label:'Scholarship Configuration'}, {id:'help', label:'Verification Appeals'} ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '14px 32px', backgroundColor: activeTab === t.id ? 'var(--primary)' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-muted)', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ minHeight: '500px' }}>
        {activeTab === 'verified' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {verifiedApps.length === 0 ? (
               <div style={{ padding: '80px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>No validated applications waiting for final authorization.</div>
            ) : (
               verifiedApps.map((app, index) => (
                  <div key={app.applicationId} style={{ backgroundColor: 'var(--bg-card)', padding: '32px 40px', borderRadius: '28px', border: index === 0 ? '1.5px solid var(--accent)' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
                     <div>
                        <b style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{app.student?.name}</b>
                        <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '14px', marginTop: '6px', opacity: 0.9 }}>{app.scholarship?.course} • {app.finalAmount}% Recommended</p>
                     </div>
                     <button onClick={() => setViewingApp(app)} style={{ padding: '16px 32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '16px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>Process Approval</button>
                  </div>
               ))
            )}
          </div>
        )}

        {activeTab === 'manage' && (
           <>
           <button onClick={() => { setEditingScholarship(null); setIsAdding(true); }} style={{ padding: '18px 36px', backgroundColor: 'var(--accent)', borderRadius: '18px', border: 'none', color: 'white', fontWeight: '900', fontSize: '16px', marginBottom: '40px', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)' }}>+ Create New Scholarship Authority</button>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
              {scholarships.length === 0 ? (
                 <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No scholarship authorities detected. Initialize one using the button above.</div>
              ) : (
                scholarships.map(s => (
                  <div key={s.scholarshipId} style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', transition: 'all 0.3s ease', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '850', color: 'var(--text-main)', letterSpacing: '-0.5px', maxWidth: '80%' }}>{s.course}</h3>
                        <button onClick={() => deleteScholarship(s.scholarshipId)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Delete Scholarship Authority">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px' }}>
                           <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Requirement</p>
                           <p style={{ fontSize: '14px', fontWeight: '700' }}>{s.minPercentage}% Score</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px' }}>
                           <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Income Cap</p>
                           <p style={{ fontSize: '14px', fontWeight: '700' }}>₹{s.maxIncome?.toLocaleString()}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px' }}>
                           <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Base Grant</p>
                           <p style={{ fontSize: '14px', fontWeight: '700' }}>{s.baseAmount}% Min</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px' }}>
                           <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Defence Priority</p>
                           <p style={{ fontSize: '14px', fontWeight: '700', color: s.isDefencePriorityActive ? 'var(--accent)' : 'var(--danger)' }}>{s.isDefencePriorityActive ? 'ACTIVE' : 'INACTIVE'}</p>
                        </div>
                     </div>
                     <button onClick={() => { setEditingScholarship(s); setIsAdding(true); }} style={{ width: '100%', padding: '16px', border: '1.5px solid var(--primary)', borderRadius: '14px', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = 'white'; }}>Configure Master Parameters</button>
                  </div>
                ))
              )}
           </div>
           </>
        )}

        {activeTab === 'help' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7 }}>🛡️ Final Adjudication: Academic Appeals Registry</p>
            {helpRequests.length === 0 ? (
               <div style={{ padding: '80px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>No executive appeals pending review.</div>
            ) : (
               helpRequests.map(h => (
                  <div key={h.requestId} style={{ backgroundColor: 'var(--bg-card)', padding: '32px 40px', borderRadius: '32px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
                     <div style={{ maxWidth: '75%' }}>
                        <b style={{ fontSize: '24px', fontWeight: '850', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{h.student?.name}</b>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                           <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>Verifier Logic: {h.remarks || "Base Review"}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '16px', lineHeight: '1.6', fontWeight: '500' }}>"{h.reason}"</p>
                     </div>
                     <button onClick={() => setViewingHelp(h)} style={{ padding: '16px 32px', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>Executive Review</button>
                  </div>
               ))
            )}
          </div>
        )}
      </div>

      {/* EXECUTIVE REVIEW MODAL */}
      {viewingHelp && (
         <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '750px', border: '1px solid var(--border)', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)' }}>
               <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '32px', letterSpacing: '-1.5px' }}>Executive Adjudication</h2>
               
               <div style={{ padding: '24px', backgroundColor: 'var(--bg-dark)', borderRadius: '20px', marginBottom: '32px', border: '1.5px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Verifier Recommendation</p>
                  <p style={{ color: 'var(--accent)', fontWeight: '700', fontStyle: 'italic', fontSize: '15px', lineHeight: '1.5' }}>"{viewingHelp.remarks}"</p>
               </div>

               {viewingHelp.documents?.length > 0 && (
                 <div style={{ marginBottom: '32px' }}>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Critical Evidence Registry</p>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                     {viewingHelp.documents.map(doc => (
                       <div key={doc.id} style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '14px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid var(--border)' }}>
                         <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-main)' }}>{doc.name}</span>
                         <a href={`http://localhost:8080/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase' }}>View Link</a>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Official Decision Rationale</label>
               <textarea value={adminRemarks} onChange={(e) => setAdminRemarks(e.target.value)} placeholder="Provide the final administrative justification for this decision..." style={{ width: '100%', padding: '20px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: '16px', color: 'white', minHeight: '130px', marginBottom: '32px', outline: 'none', resize: 'none', fontSize: '15px', fontWeight: '500', lineHeight: '1.6' }} />
               
               <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleHelpAction('REQUEST_REJECTED')} style={{ flex: 1, padding: '18px', backgroundColor: 'transparent', color: 'var(--danger)', border: '2px solid var(--danger)', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}>Deny Appeal</button>
                  <button onClick={() => handleHelpAction('REQUEST_APPROVED')} style={{ flex: 1, padding: '18px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '850', cursor: 'pointer', fontSize: '15px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>Authorize Waiver</button>
               </div>
               <button onClick={() => setViewingHelp(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', marginTop: '24px', width: '100%', cursor: 'pointer', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Discard Review</button>
            </div>
         </div>
      )}

      {/* DISBURSEMENT AUTHORIZATION MODAL */}
      {viewingApp && (
         <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '650px', border: '1px solid var(--border)', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)' }}>
               <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '32px', letterSpacing: '-1.5px' }}>Authorization.</h2>
               <div style={{ backgroundColor: 'var(--bg-dark)', padding: '40px', borderRadius: '24px', marginBottom: '32px', border: '2px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '10px', letterSpacing: '2px' }}>Final Calculated Disbursement</p>
                  <h1 style={{ fontSize: '64px', fontWeight: '950', color: 'var(--accent)', letterSpacing: '-3px' }}>{viewingApp.finalAmount}%</h1>
                  <p style={{ color: 'var(--primary)', fontWeight: '750', fontSize: '14px', marginTop: '12px' }}>{viewingApp.student?.name}</p>
               </div>

               {viewingApp.documents?.length > 0 && (
                 <div style={{ marginBottom: '32px' }}>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Verified Source Audit</p>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                     {viewingApp.documents.map(doc => (
                       <div key={doc.id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid var(--border)' }}>
                         <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-muted)' }}>{doc.name}</span>
                         <a href={`http://localhost:8080/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase' }}>Audit View</a>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleAppAction(viewingApp.applicationId, 'REJECTED_BY_ADMIN')} style={{ flex: 1, padding: '18px', backgroundColor: 'transparent', color: 'var(--danger)', borderRadius: '16px', border: '2px solid var(--danger)', fontWeight: '800', fontSize: '15px' }}>Void Claim</button>
                  <button onClick={() => handleAppAction(viewingApp.applicationId, 'APPROVED')} style={{ flex: 1, padding: '18px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '15px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)' }}>Authorize Payout</button>
               </div>
               <button onClick={() => setViewingApp(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', marginTop: '24px', width: '100%', cursor: 'pointer', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Cancel Selection</button>
            </div>
         </div>
      )}
      
      {/* SCHOLARSHIP CONFIGURATION MODAL */}
      {isAdding && (
         <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '700px', border: '1px solid var(--border)', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)' }}>
               <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '32px', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>{editingScholarship ? 'Configure Engine.' : 'Create Authority.'}</h2>
               <form onSubmit={handleScholarshipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Course Identity</label>
                        <input name="course" defaultValue={editingScholarship?.course} placeholder="e.g. B.Tech Computer Science" style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '600' }} required />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Scholarship (%)</label>
                        <input name="baseAmount" defaultValue={editingScholarship?.baseAmount || 100} type="number" placeholder="100" style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '600' }} required />
                     </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Min Marks (%)</label>
                        <input name="minPercentage" defaultValue={editingScholarship?.minPercentage} type="number" placeholder="e.g. 80" style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '600' }} required />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Max Income (₹)</label>
                        <input name="maxIncome" defaultValue={editingScholarship?.maxIncome} type="number" placeholder="e.g. 500000" style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '600' }} required />
                     </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '18px', border: '1.5px solid var(--border)' }}>
                     <input name="defence" defaultChecked={editingScholarship?.isDefencePriorityActive} type="checkbox" style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                     <div>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>Enable Defence Priority Multiplier</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Prioritize verification for candidates from defence backgrounds.</p>
                     </div>
                  </div>

                  <button type="submit" style={{ padding: '22px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '16px', marginTop: '12px', boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)' }}>Commit Authority Configuration</button>
                  <button type="button" onClick={() => setIsAdding(false)} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', fontSize: '14px', fontWeight: '750', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>Cancel Update</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
