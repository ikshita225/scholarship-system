import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, UserCheck, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const portals = [
    { title: 'Student Portal', icon: <User size={40} />, role: 'STUDENT', desc: 'Secure gateway for candidates to submit applications, manage documents, and track scholarship progress.', color: 'var(--primary)' },
    { title: 'Verifier Access', icon: <Shield size={40} />, role: 'VERIFIER', desc: 'Administrative interface for verification officers to validate student data and forward valid claims.', color: 'var(--primary)' },
    { title: 'Administrator', icon: <UserCheck size={40} />, role: 'ADMIN', desc: 'High-level dashboard for managing systems, user permissions, and final scholarship disbursement.', color: 'var(--primary)' }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '800px' }}>
         <h1 style={{ fontSize: '64px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2.5px', lineHeight: '1.1', marginBottom: '20px' }}>ScholarPath</h1>
         <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>Official Academic Verification & Support Gateway</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '1200px', width: '100%' }}>
        {portals.map((p) => (
          <div 
            key={p.role} 
            onClick={() => navigate('/login', { state: { role: p.role } })} 
            style={{ 
                backgroundColor: 'var(--bg-card)', 
                padding: '48px 32px', 
                borderRadius: '32px', 
                border: '1px solid var(--border)', 
                textAlign: 'center', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
            onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'var(--primary)'; 
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'var(--border)'; 
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
          >
            <div style={{ 
                width: '90px', 
                height: '90px', 
                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                borderRadius: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 32px', 
                color: 'var(--primary)', 
                border: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
            }}>
               {p.icon}
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{p.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500', lineHeight: '1.7', marginBottom: '40px', minHeight: '80px' }}>{p.desc}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
               Enter Access Portal <ArrowRight size={20} />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '80px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500', opacity: 0.6 }}>
        © 2026 Academic Scholarship & Support Systems • Secure Environment
      </div>
    </div>
  );
};

export default LandingPage;
