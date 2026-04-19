import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Search, X, CheckCircle, XCircle, Eye, 
  FileText, AlertTriangle, TrendingUp, Filter, Download, MessageSquare
} from 'lucide-react';

const VerifierDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedHelp, setSelectedHelp] = useState(null);
  
  const [remarks, setRemarks] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${user.token}` } };
      const [appRes, helpRes] = await Promise.all([
        axios.get('https://scholarship-backend-qbkn.onrender.com/api/verifier/pending', config),
        axios.get('https://scholarship-backend-qbkn.onrender.com/api/verifier/help-requests', config)
      ]);
      setApplications(appRes.data);
      setHelpRequests(helpRes.data);
      setLoading(false);
    } catch (err) { 
        console.error(err); 
        setLoading(false); 
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
             alert('SECURE SESSION EXPIRED: Verifier token neutralized. Please log in again.');
             localStorage.removeItem('user');
             window.location.href = '/login';
        }
    }
  };

  const handleAppAction = async (status) => {
    if (!remarks) { alert("Adding remarks is mandatory for tracking."); return; }
    try {
      await axios.post(`https://scholarship-backend-qbkn.onrender.com/api/verifier/applications/${selectedApp.applicationId}/status`, null, {
        params: { status, remarks },
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setSelectedApp(null); setRemarks(''); fetchData();
    } catch (err) { alert("Error."); }
  };

  const handleHelpAction = async (status) => {
    if (!remarks) { alert("Adding remarks is mandatory for the escalation chain."); return; }
    try {
      await axios.post(`https://scholarship-backend-qbkn.onrender.com/api/verifier/help-requests/${selectedHelp.requestId}/status`, null, {
        params: { status, remarks },
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setSelectedHelp(null); setRemarks(''); fetchData();
    } catch (err) { alert("Escalation failed."); }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-main)', padding: '80px 8%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <div>
           <h1 style={{ fontSize: '56px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2.5px' }}>Verifier Portal.</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>First-Level Verification Authority: {user.name}</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '60px', backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '18px', width: 'fit-content', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {[ {id:'applications', label:'Pending Applications'}, {id:'help', label:'Appeal Requests'} ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '14px 32px', backgroundColor: activeTab === t.id ? 'var(--primary)' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-muted)', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'applications' && (
         <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.25)', textAlign: 'left' }}>
                  <th style={{ padding: '24px 40px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Candidate Details</th>
                  <th style={{ padding: '24px 40px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Target Course Authority</th>
                  <th style={{ padding: '24px 40px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>No inbound application tokens detected in the queue.</td></tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.applicationId} style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '28px 40px' }}><p style={{ fontWeight: '850', color: 'var(--text-main)', fontSize: '18px', letterSpacing: '-0.5px' }}>{app.student?.name}</p></td>
                        <td style={{ padding: '28px 40px' }}><span style={{ color: 'var(--primary)', fontWeight: '750', fontSize: '16px' }}>{app.scholarship?.course}</span></td>
                        <td style={{ padding: '28px 40px', textAlign: 'right' }}><button onClick={() => setSelectedApp(app)} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)' }}>Initialize Review</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
         </div>
      )}

      {activeTab === 'help' && (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
            {helpRequests.length === 0 ? (
               <div style={{ gridColumn: '1 / -1', padding: '80px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>The appeal registry is currently clear.</div>
            ) : (
               helpRequests.map(help => (
                  <div key={help.requestId} style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '850', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>APPEAL #{help.requestId}</p>
                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '850', border: '1px solid rgba(245, 158, 11, 0.3)' }}>AT STAGE 1</span>
                     </div>
                     <h3 style={{ fontSize: '24px', fontWeight: '850', marginBottom: '12px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{help.student?.name}</h3>
                     <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6', fontWeight: '500' }}>"{help.reason}"</p>
                     <button onClick={() => setSelectedHelp(help)} style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--primary)', border: '1.5px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)'}>Formal Adjudication</button>
                  </div>
               ))
            )}
         </div>
      )}

      {/* HELP EVALUATION MODAL */}
      <AnimatePresence>
        {selectedHelp && (
           <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: '100%', maxWidth: '700px', backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)' }}>
                 <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>Waiver Review.</h2>
                 <p style={{ color: 'var(--primary)', fontWeight: '750', marginBottom: '40px', fontSize: '15px' }}>Authority Context: {selectedHelp.scholarship?.course}</p>
                 
                 {selectedHelp.documents && selectedHelp.documents.length > 0 && (
                   <div style={{ marginBottom: '32px' }}>
                     <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Appeal Evidence Dossier</label>
                     <div style={{ display: 'grid', gap: '12px' }}>
                       {selectedHelp.documents.map(doc => (
                         <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-dark)', padding: '18px 24px', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                             <FileText size={20} color="var(--primary)" />
                             <span style={{ fontSize: '15px', fontWeight: '750', color: 'var(--text-main)' }}>{doc.name}</span>
                           </div>
                           <a 
                             href={`https://scholarship-backend-qbkn.onrender.com/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                             style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}
                           >
                             <Download size={16} /> Fetch Log
                           </a>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Board Official Remarks</label>
                 <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide high-level context for the final administrator adjudication..." style={{ width: '100%', padding: '20px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: '16px', color: 'white', minHeight: '150px', marginBottom: '32px', outline: 'none', fontSize: '16px', resize: 'none', lineHeight: '1.6', fontWeight: '500' }} />
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button onClick={() => handleHelpAction('REJECTED_BY_VERIFIER')} style={{ padding: '18px', backgroundColor: 'transparent', color: 'var(--danger)', border: '2px solid var(--danger)', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>Decline Waiver</button>
                    <button onClick={() => handleHelpAction('VERIFIED_BY_VERIFIER')} style={{ padding: '18px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '15px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>Escalate to Board</button>
                 </div>
                 <button onClick={() => setSelectedHelp(null)} style={{ width: '100%', marginTop: '24px', background: 'none', border:'none', color: 'var(--text-muted)', fontWeight: '750', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Discard Draft</button>
              </div>
           </div>
        )}
      </AnimatePresence>
 
       {/* APPLICATION SIDE REVIEW PANEL */}
      <AnimatePresence>
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.92)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '100%', maxWidth: '750px', backgroundColor: 'var(--bg-card)', height: '100vh', padding: '60px', borderLeft: '1.5px solid var(--border)', overflowY: 'auto', boxShadow: '-25px 0 50px -12px rgba(0, 0, 0, 0.5)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                 <div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>Data Audit.</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: '750', fontSize: '16px', marginTop: '6px' }}>Candidate: {selectedApp.student?.name}</p>
                 </div>
                 <button onClick={() => setSelectedApp(null)} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'}><X size={28}/></button>
              </div>
              
              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>Candidate Evidence Index</label>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {selectedApp.documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-dark)', padding: '20px 28px', borderRadius: '18px', border: '1.5px solid var(--border)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <FileText size={22} color="var(--primary)" />
                          <span style={{ fontSize: '16px', fontWeight: '750', color: 'var(--text-main)' }}>{doc.name}</span>
                        </div>
                        <a 
                          href={`https://scholarship-backend-qbkn.onrender.com/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                          <Download size={18} /> Audit
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>Verification Consensus</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide high-fidelity justification for the verification outcome..." style={{ width: '100%', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '20px', color: 'white', marginBottom: '40px', minHeight: '180px', outline: 'none', fontSize: '16px', resize: 'none', lineHeight: '1.7', fontWeight: '500' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <button onClick={() => handleAppAction('REJECTED_BY_VERIFIER')} style={{ padding: '20px', backgroundColor: 'transparent', color: 'var(--danger)', border: '2px solid var(--danger)', borderRadius: '18px', fontWeight: '850', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}>Reject Application</button>
                 <button onClick={() => handleAppAction('VERIFIED')} style={{ padding: '20px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)' }}>Verify Application</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifierDashboard;
