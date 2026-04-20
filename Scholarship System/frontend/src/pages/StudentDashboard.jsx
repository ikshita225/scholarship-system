import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FALLBACK_SCHOLARSHIPS = [
    { scholarshipId: 1, course: "Computer Science", minPercentage: 85, maxIncome: 300000, baseAmount: 50, isDefencePriorityActive: true },
    { scholarshipId: 2, course: "BBA", minPercentage: 75, maxIncome: 350000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 3, course: "Architecture", minPercentage: 80, maxIncome: 350000, baseAmount: 55, isDefencePriorityActive: true },
    { scholarshipId: 4, course: "MBA", minPercentage: 88, maxIncome: 350000, baseAmount: 70, isDefencePriorityActive: true },
    { scholarshipId: 5, course: "Mathematics", minPercentage: 78, maxIncome: 300000, baseAmount: 50, isDefencePriorityActive: true },
    { scholarshipId: 6, course: "M.Com", minPercentage: 76, maxIncome: 350000, baseAmount: 45, isDefencePriorityActive: true },
    { scholarshipId: 7, course: "B.Tech", minPercentage: 83, maxIncome: 350000, baseAmount: 60, isDefencePriorityActive: true },
    { scholarshipId: 8, course: "BCA", minPercentage: 72, maxIncome: 300000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 9, course: "M.Tech", minPercentage: 90, maxIncome: 350000, baseAmount: 85, isDefencePriorityActive: true },
    { scholarshipId: 10, course: "Physics", minPercentage: 81, maxIncome: 250000, baseAmount: 50, isDefencePriorityActive: true },
    { scholarshipId: 11, course: "Chemistry", minPercentage: 79, maxIncome: 250000, baseAmount: 50, isDefencePriorityActive: true },
    { scholarshipId: 12, course: "Biology", minPercentage: 82, maxIncome: 300000, baseAmount: 50, isDefencePriorityActive: true },
    { scholarshipId: 13, course: "English Literature", minPercentage: 70, maxIncome: 300000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 14, course: "Economics", minPercentage: 84, maxIncome: 350000, baseAmount: 60, isDefencePriorityActive: true },
    { scholarshipId: 15, course: "Psychology", minPercentage: 77, maxIncome: 300000, baseAmount: 45, isDefencePriorityActive: true },
    { scholarshipId: 16, course: "Law", minPercentage: 86, maxIncome: 350000, baseAmount: 70, isDefencePriorityActive: true },
    { scholarshipId: 17, course: "Journalism", minPercentage: 74, maxIncome: 350000, baseAmount: 45, isDefencePriorityActive: true },
    { scholarshipId: 18, course: "Fine Arts", minPercentage: 65, maxIncome: 200000, baseAmount: 35, isDefencePriorityActive: true },
    { scholarshipId: 19, course: "Nursing", minPercentage: 82, minPercentage: 82, maxIncome: 300000, baseAmount: 55, isDefencePriorityActive: true },
    { scholarshipId: 20, course: "Civil Engineering", minPercentage: 81, maxIncome: 350000, baseAmount: 55, isDefencePriorityActive: true },
    { scholarshipId: 21, course: "Mechanical Engineering", minPercentage: 82, maxIncome: 350000, baseAmount: 55, isDefencePriorityActive: true },
    { scholarshipId: 22, course: "Electrical Engineering", minPercentage: 83, maxIncome: 350000, baseAmount: 55, isDefencePriorityActive: true },
    { scholarshipId: 23, course: "Political Science", minPercentage: 72, maxIncome: 300000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 24, course: "History", minPercentage: 71, maxIncome: 250000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 25, course: "Geography", minPercentage: 73, maxIncome: 300000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 26, course: "Sociology", minPercentage: 74, maxIncome: 300000, baseAmount: 40, isDefencePriorityActive: true },
    { scholarshipId: 27, course: "Pharmacy", minPercentage: 84, maxIncome: 350000, baseAmount: 60, isDefencePriorityActive: true },
    { scholarshipId: 28, course: "Agriculture", minPercentage: 75, maxIncome: 250000, baseAmount: 45, isDefencePriorityActive: true },
    { scholarshipId: 29, course: "Commerce", minPercentage: 77, maxIncome: 350000, baseAmount: 45, isDefencePriorityActive: true },
    { scholarshipId: 30, course: "Education (B.Ed)", minPercentage: 78, maxIncome: 350000, baseAmount: 45, isDefencePriorityActive: true }
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [helpScholarship, setHelpScholarship] = useState(null);
  const [helpReason, setHelpReason] = useState('');
  const [helpFiles, setHelpFiles] = useState({ marksheet: null, income: null, caste: null });
  const [applyFiles, setApplyFiles] = useState({ marksheet: null, aadhaar: null, income: null, caste: null, defence: null, defenceApplied: false });
  
  const [localMarks, setLocalMarks] = useState('');
  const [localIncome, setLocalIncome] = useState('');
  const [localCaste, setLocalCaste] = useState('GEN');

  useEffect(() => { fetchData(); }, []);

  const resetApplyForm = () => {
      setLocalMarks(''); setLocalIncome(''); setLocalCaste('GEN');
      setApplyFiles({ marksheet: null, aadhaar: null, income: null, caste: null, defence: null });
  };

  const API_URL = 'https://scholarship-backend-qbkn.onrender.com';

  const fetchData = async () => {
    if (!user?.userId || !user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const config = { headers: { 'Authorization': `Bearer ${user.token}` } };
      const [sRes, aRes, hRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/scholarships`, config),
        axios.get(`${API_URL}/api/student/my-applications/${user.userId}`, config),
        axios.get(`${API_URL}/api/student/help-requests/${user.userId}`, config)
      ]);
      setScholarships(sRes.data.length > 0 ? sRes.data : FALLBACK_SCHOLARSHIPS);
      setApplications(aRes.data || []);
      setHelpRequests(hRes.data || []);
      setLoading(false);
    } catch (err) { 
      console.error("FETCH DATA ERROR:", err);
      setScholarships(FALLBACK_SCHOLARSHIPS);
      setLoading(false);
      // Let the user know if their tracking data failed to load
      if (err.response?.status !== 404) {
         setError("Failed to load your tracking status. Please refresh.");
      }
    }
  };

  const calculateSmartScore = () => {
    if (!selectedScholarship || !localMarks) return 0;
    let score = 0;
    const marks = parseFloat(localMarks);
    const income = parseFloat(localIncome) || 0;
    score += Math.min(40, (marks / 100) * 40);
    if (income > 0) score += Math.max(0, 30 - (income / 500000) * 30);
    if (localCaste !== 'GEN') score += 20;
    if (applyFiles.defence) score += 10;
    return Math.round(score);
  };

  const getMatchLevel = (score) => {
    if (score > 80) return { label: 'HIGH MATCH', color: '#10b981' };
    if (score > 50) return { label: 'MODERATE', color: '#f59e0b' };
    return { label: 'LOW MATCH', color: '#ef4444' };
  };

  const checkApprovedHelp = (sid) => helpRequests.some(r => r.scholarship.scholarshipId === sid && r.status === 'REQUEST_APPROVED');

  const handleApply = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('studentId', user.userId);
    formData.append('scholarshipId', selectedScholarship.scholarshipId);
    formData.append('twelfthPercentage', localMarks);
    formData.append('familyIncome', localIncome);
    formData.append('caste', localCaste);
    if (applyFiles.marksheet) formData.append('marksheet', applyFiles.marksheet);
    if (applyFiles.aadhaar) formData.append('aadhaar', applyFiles.aadhaar);
    if (applyFiles.income) formData.append('bpl', applyFiles.income);
    if (applyFiles.caste) formData.append('casteCertificate', applyFiles.caste);
    if (applyFiles.defence) formData.append('defence', applyFiles.defence);

    try {
      await axios.post(`${API_URL}/api/student/apply`, formData, { headers: { 'Authorization': `Bearer ${user.token}` } });
      alert('SUCCESS: Documents submitted.');
      setSelectedScholarship(null); resetApplyForm(); fetchData();
    } catch (err) { 
        console.error("SUBMISSION ERROR:", err);
        let errorMsg = "Network connection failed";
        if (err.response?.data) {
            errorMsg = typeof err.response.data === 'object' 
                ? (err.response.data.message || JSON.stringify(err.response.data)) 
                : err.response.data;
        }
        alert(`SUBMISSION FAILED: ${errorMsg}\n\nCheck if your backend on Render is 'Live' and the total file size is not too large.`); 
    }
  };

  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('studentId', user.userId);
    formData.append('scholarshipId', helpScholarship?.scholarshipId || (scholarships.length > 0 ? scholarships[0].scholarshipId : null));
    formData.append('reason', helpReason);
    if (helpFiles.marksheet) formData.append('marksheet', helpFiles.marksheet);
    if (helpFiles.income) formData.append('incomeProof', helpFiles.income);
    if (helpFiles.caste) formData.append('casteCertificate', helpFiles.caste);

    try {
      await axios.post(`${API_URL}/api/student/help-requests`, formData, { headers: { 'Authorization': `Bearer ${user.token}` } });
      alert('APPEAL TRANSMITTED: Stage 1 (Verifier Review) initiated.');
      setHelpReason('');
      setHelpScholarship(null);
      setHelpFiles({ marksheet: null, income: null, caste: null });
      fetchData();
    } catch (err) { alert("Submission failed."); }
  };

  const getHelpStatusLabel = (status) => {
     switch(status) {
        case 'PENDING_VERIFIER': return { text: 'AT VERIFIER (STAGE 1)', color: '#94a3b8' };
        case 'VERIFIED_BY_VERIFIER': return { text: 'VERIFIER CLEARED (IN-TRANSIT TO ADMIN)', color: '#3b82f6' };
        case 'REJECTED_BY_VERIFIER': return { text: 'REJECTED BY VERIFIER', color: '#ef4444' };
        case 'REQUEST_APPROVED': return { text: 'APPROVED BY ADMIN', color: '#10b981' };
        case 'REQUEST_REJECTED': return { text: 'REJECTED BY ADMIN', color: '#ef4444' };
        default: return { text: status, color: '#94a3b8' };
     }
  };

  const FileUploadBox = ({ label, onChange, fileName }) => (
    <div style={{ position: 'relative', marginTop: '15px' }}>
      <input type="file" onChange={onChange} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', zIndex: 2 }} />
      <div style={{ padding: '20px', backgroundColor: '#020617', borderRadius: '15px', border: '2px dashed #1e293b', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: fileName ? '#10b981' : '#64748b', fontWeight: '950' }}>{fileName ? `✓ ${fileName.toUpperCase()}` : `📁 UPLOAD ${label}`}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '80px 8%', backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        {error && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--danger)', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 2000, fontWeight: '700', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' }}>{error}</div>}
        <div>
           <h1 style={{ fontSize: '56px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2.5px' }}>Student Dashboard.</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>Identity Verified: <span style={{ color: 'var(--primary)' }}>{user.name}</span></p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '14px 32px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)'; }}>Sign Out</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '60px', backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '18px', width: 'fit-content', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {[ {id:'browse', label:'Browse Opportunities'}, {id:'tracking', label:'Track Status'}, {id:'help', label:'Support/Help'} ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '14px 32px', backgroundColor: activeTab === t.id ? 'var(--primary)' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-muted)', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '30px' }}>
          {loading && scholarships.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '120px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-muted)', opacity: 0.7 }}>Scanning for matching scholarships...</h2>
             </div>
          ) : scholarships.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '120px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-muted)', opacity: 0.7 }}>No scholarships available at this moment.</h2>
             </div>
          ) : (
             scholarships.map(s => (
                <div key={s.scholarshipId} style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent)', pointerEvents: 'none' }}></div>
                   <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', letterSpacing: '-1px' }}>{s.course}</h3>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.25)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <span>Eligibility: {Math.floor(s.minPercentage)}% Score</span>
                      {s.maxIncome && <span style={{ color: 'var(--border)', opacity: 0.5 }}>|</span>}
                      {s.maxIncome && <span>Income ≤ ₹{s.maxIncome.toLocaleString()}</span>}
                   </div>
                   <button onClick={() => { resetApplyForm(); setSelectedScholarship(s); }} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Apply</button>
                </div>
             ))
          )}
        </div>
      )}

      {activeTab === 'help' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '40px' }}>
           <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)', letterSpacing: '-1px' }}>New Appeal</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', fontWeight: '500' }}>Submit a query for manual review by the verification board.</p>
              
              <form onSubmit={handleHelpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <select value={helpScholarship?.scholarshipId || ''} onChange={(e) => setHelpScholarship(scholarships.find(s => s.scholarshipId === parseInt(e.target.value)))} style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '600', outline: 'none', fontSize: '15px' }}>
                    <option value="">Select Target Scholarship</option>
                    {scholarships.map(s => <option key={s.scholarshipId} value={s.scholarshipId}>{s.course}</option>)}
                 </select>
                 <textarea value={helpReason} onChange={(e) => setHelpReason(e.target.value)} placeholder="Provide specific details about your situation..." style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', minHeight: '180px', fontSize: '15px', outline: 'none', resize: 'none', lineHeight: '1.6' }} required />
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <FileUploadBox label="MARKS" fileName={helpFiles.marksheet?.name} onChange={(e) => setHelpFiles({...helpFiles, marksheet: e.target.files[0]})} />
                    <FileUploadBox label="INCOME" fileName={helpFiles.income?.name} onChange={(e) => setHelpFiles({...helpFiles, income: e.target.files[0]})} />
                    <FileUploadBox label="CASTE" fileName={helpFiles.caste?.name} onChange={(e) => setHelpFiles({...helpFiles, caste: e.target.files[0]})} />
                 </div>
                 <button type="submit" style={{ padding: '20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '12px', transition: 'all 0.3s ease' }}>Transmit Appeal</button>
              </form>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)', letterSpacing: '-1px' }}>Support Log</h2>
                 {helpRequests.length === 0 ? (
                    <div style={{ padding: '50px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>No active background processes found.</div>
                 ) : (
                    helpRequests.map(r => {
                       const statusConfig = getHelpStatusLabel(r.status);
                       return (
                          <div key={r.requestId} style={{ padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '28px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <b style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>TICKET #{r.requestId} • {r.scholarship?.course}</b>
                                <span style={{ fontSize: '10px', fontWeight: '850', color: statusConfig.color, backgroundColor: `${statusConfig.color}15`, padding: '4px 12px', borderRadius: '8px', border: `1px solid ${statusConfig.color}30` }}>{statusConfig.text}</span>
                             </div>
                             <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>"{r.reason}"</p>
                             {r.remarks && (
                                <div style={{ padding: '20px', backgroundColor: 'var(--bg-dark)', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
                                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Board Official Resolution:</p>
                                   <p style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.5' }}>{r.remarks}</p>
                                </div>
                             )}
                          </div>
                       )
                    })
                 )}
           </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
           {applications.length === 0 ? (
              <div style={{ padding: '60px', backgroundColor: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>No application submissions detected on this profile.</div>
           ) : (
              applications.map(app => (
                 <div key={app.applicationId} style={{ backgroundColor: 'var(--bg-card)', padding: '32px 40px', borderRadius: '28px', border: app.status === 'APPROVED' ? '2.5px solid var(--accent)' : app.status.includes('REJECTED') ? '2.5px solid var(--danger)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <h4 style={{ fontWeight: '800', fontSize: '24px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{app.scholarship?.course}</h4>
                           <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '1px' }}>SUBMISSION ID: SCH-{app.applicationId}</p>
                           {app.status === 'APPROVED' && (
                              <p style={{ color: 'var(--accent)', fontWeight: '900', fontSize: '20px', marginTop: '16px' }}>{app.finalAmount}% Direct Authorization Granted</p>
                           )}
                        </div>
                        <div style={{ 
                           padding: '12px 28px', 
                           backgroundColor: app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : app.status.includes('REJECTED') ? 'rgba(248, 113, 113, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                           color: app.status === 'APPROVED' ? 'var(--accent)' : app.status.includes('REJECTED') ? 'var(--danger)' : 'var(--primary)', 
                           borderRadius: '14px', 
                           fontWeight: '850',
                           fontSize: '13px',
                           textTransform: 'uppercase',
                           letterSpacing: '1px',
                           border: `1.5px solid ${app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.3)' : app.status.includes('REJECTED') ? 'rgba(248, 113, 113, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                           {app.status === 'APPROVED' ? 'Authorized' : app.status.replace(/_/g, ' ')}
                        </div>
                    </div>

                    {app.remarks && (
                       <div style={{ padding: '24px', backgroundColor: 'var(--bg-dark)', borderRadius: '18px', border: app.status.includes('REJECTED') ? '1.5px solid var(--danger)' : '1.5px solid var(--border)', marginTop: '4px' }}>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Board Official Resolution:</p>
                          <p style={{ fontSize: '14px', color: app.status.includes('REJECTED') ? 'var(--danger)' : 'var(--accent)', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.6' }}>"{app.remarks}"</p>
                       </div>
                    )}
                  </div>
               ))
            )}
        </div>
      )}

      {/* VERIFICATION ENGINE MODAL */}
      {selectedScholarship && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
           <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '900px', border: '1px solid var(--border)', position: 'relative', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)' }}>
              <button onClick={() => { setSelectedScholarship(null); resetApplyForm(); }} style={{ position: 'absolute', top: '32px', right: '32px', backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'}>✕</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                 <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1.5px' }}>Application Engine.</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>Target: {selectedScholarship.course}</p>
                 </div>
                 <div style={{ backgroundColor: 'var(--bg-dark)', padding: '16px 32px', borderRadius: '20px', border: '2px solid var(--border)', textAlign: 'center', minWidth: '150px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Merit Index</p>
                    <h1 style={{ fontSize: '36px', fontWeight: '900', color: getMatchLevel(calculateSmartScore()).color }}>{calculateSmartScore()}</h1>
                 </div>
              </div>

              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                       <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>Academic Score (%)</label>
                       <input value={localMarks} onChange={(e) => setLocalMarks(e.target.value)} type="number" step="1" placeholder="e.g. 92" style={{ width: '100%', padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '600', outline: 'none', fontSize: '16px' }} required />
                       <FileUploadBox label="MARKSHEET" fileName={applyFiles.marksheet?.name} onChange={(e) => setApplyFiles({...applyFiles, marksheet: e.target.files[0]})} />
                    </div>
                    <div>
                       <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>Annual Income (₹)</label>
                       <input value={localIncome} onChange={(e) => setLocalIncome(e.target.value)} type="number" placeholder="e.g. 350000" style={{ width: '100%', padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '600', outline: 'none', fontSize: '16px' }} required />
                       <FileUploadBox label="INCOME PROOF" fileName={applyFiles.income?.name} onChange={(e) => setApplyFiles({...applyFiles, income: e.target.files[0]})} />
                    </div>
                    <div>
                       <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>Social Category</label>
                       <select value={localCaste} onChange={(e) => setLocalCaste(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '14px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '600', outline: 'none', fontSize: '16px' }}>
                          <option value="GEN">General (Merit)</option><option value="OBC">OBC (Reserved)</option><option value="SC">SC (Reserved)</option><option value="ST">ST (Reserved)</option>
                       </select>
                       <FileUploadBox label="CASTE CERTIFICATE" fileName={applyFiles.caste?.name} onChange={(e) => setApplyFiles({...applyFiles, caste: e.target.files[0]})} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>Defence Affiliation</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-dark)', padding: '18px', borderRadius: '14px', border: '1.5px solid var(--border)', marginBottom: '8px', height: '62px' }}>
                           <input type="checkbox" id="defenceToggle" onChange={(e) => setApplyFiles({...applyFiles, defenceApplied: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                           <label htmlFor="defenceToggle" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Ward of Defence Personnel</label>
                        </div>
                        <FileUploadBox label="DEFENCE ID CARD" fileName={applyFiles.defence?.name} onChange={(e) => setApplyFiles({...applyFiles, defence: e.target.files[0]})} />
                    </div>
                 </div>
                 
                 <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>Identification (Aadhaar Key)</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                       <div style={{ padding: '14px 24px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1.5px dashed var(--border)', color: 'var(--text-muted)', fontSize: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>IDENTITY ENCRYPTION ACTIVE</div>
                       <div style={{ flex: 1.5 }}>
                          <FileUploadBox label="UPLOAD IDENTITY DATA" fileName={applyFiles.aadhaar?.name} onChange={(e) => setApplyFiles({...applyFiles, aadhaar: e.target.files[0]})} />
                       </div>
                    </div>
                 </div>
                 
                 <button type="submit" style={{ width: '100%', padding: '22px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', marginTop: '14px', boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>Submit Application</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;