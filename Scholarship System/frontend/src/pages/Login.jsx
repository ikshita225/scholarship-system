import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, User, UserCheck } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  // Get role from history state (passed by Home.jsx) or fallback to 'STUDENT'
  const roleFromState = location.state?.role || new URLSearchParams(location.search).get('role') || 'STUDENT';

  // We ensure any state tied to identity is reset whenever the role changes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unregisteredPopup, setUnregisteredPopup] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset inputs when role changes to ensure manual-only entry
  useEffect(() => {
     setEmail('');
     setPassword('');
     setShowPassword(false);
     setUnregisteredPopup(false);
  }, [roleFromState]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://scholarship-backend-qbkn.onrender.com/api/auth/signin', { email, password });
      
      if (res.data.role !== roleFromState) {
         alert(`SYSTEM AUTHENTICATION MISMATCH: This account is registered as ${res.data.role}. Use the appropriate Portal.`);
         return;
      }

      login(res.data);
      if (res.data.role === 'ADMIN') navigate('/admin');
      else if (res.data.role === 'VERIFIER') navigate('/verifier');
      else navigate('/student');
    } catch (err) {
      if (roleFromState === 'STUDENT') {
         setUnregisteredPopup(true);
      } else {
         alert("Invalid Credentials");
      }
    }
  };

  const currentBranding = (() => {
     switch(roleFromState) {
        case 'ADMIN': return { label: 'Admin Access', color: 'var(--primary)', icon: <UserCheck size={40} /> };
        case 'VERIFIER': return { label: 'Verifier Portal', color: 'var(--primary)', icon: <Shield size={40} /> };
        default: return { label: 'Student Login', color: 'var(--primary)', icon: <User size={40} /> };
     }
  })();

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
           <div style={{ width: '85px', height: '85px', backgroundColor: 'rgba(59, 130, 246, 0.12)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid rgba(59, 130, 246, 0.25)', color: 'var(--primary)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}>
              {currentBranding.icon}
           </div>
           <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-2px', marginBottom: '12px' }}>{currentBranding.label}.</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>Secure System Authentication</p>
        </div>

        <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            padding: '50px', 
            borderRadius: '32px', 
            border: '1px solid var(--border)', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle top glow */}
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.5 }}></div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
                <input 
                type="email" placeholder="Official Email Address" value={email} onChange={(e) => setEmail(e.target.value)} 
                autoComplete="off"
                style={{ width: '100%', padding: '18px 20px 18px 56px', borderRadius: '16px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '500', outline: 'none', fontSize: '20px', transition: 'all 0.3s ease' }} required 
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
            </div>
            
            <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
                <input 
                type={showPassword ? "text" : "password"} placeholder="Security Key" value={password} onChange={(e) => setPassword(e.target.value)} 
                autoComplete="new-password"
                style={{ width: '100%', padding: '18px 56px 18px 56px', borderRadius: '16px', backgroundColor: 'var(--bg-dark)', border: '1.5px solid var(--border)', color: 'white', fontWeight: '500', outline: 'none', fontSize: '20px', transition: 'all 0.3s ease' }} required 
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div style={{ textAlign: 'right' }}>
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password', { state: { role: roleFromState } })}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: 0.9 }} 
                  onMouseEnter={e => e.target.style.opacity = 1} 
                  onMouseLeave={e => e.target.style.opacity = 0.9}
                >
                  Forgot password?
                </button>
            </div>

            <button type="submit" style={{ 
                padding: '18px', 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                borderRadius: '16px', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: '750', 
                fontSize: '18px', 
                marginTop: '10px', 
                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(59, 130, 246, 0.5)';
            }} onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(59, 130, 246, 0.4)';
            }}>
                Enter Dashboard
            </button>
            </form>
        </div>

        {roleFromState === 'STUDENT' && (
           <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>
             New to the platform? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800', borderBottom: '2px solid rgba(59, 130, 246, 0.2)', paddingBottom: '2px' }}>Enroll your account</Link>
           </p>
        )}

        {/* UNREGISTERED STUDENT POPUP */}
        {unregisteredPopup && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)' }}>
             <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '480px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(248, 113, 113, 0.12)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid rgba(248, 113, 113, 0.25)', color: 'var(--danger)' }}>
                   <User size={40} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>Enrollment Required</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '40px', fontWeight: '500', lineHeight: '1.6' }}>
                   The provided email is not registered in our scholarship database. Please enroll to create your formal profile.
                </p>

                <button onClick={() => { setUnregisteredPopup(false); navigate('/register'); }} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: '750', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)' }}>
                   Start Registration
                </button>
                <button onClick={() => setUnregisteredPopup(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                   Back to Login
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
