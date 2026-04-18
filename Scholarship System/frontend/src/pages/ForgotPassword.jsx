import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Mail, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'STUDENT';

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 1) {
        await axios.get(`http://localhost:8080/api/auth/check-user?email=${email}`);
        setStep(2);
      } else {
        await axios.post(`http://localhost:8080/api/auth/reset-password`, { email, newPassword });
        setMessage('✅ Reset successful! Moving to login...');
        setTimeout(() => navigate('/login', { state: { role } }), 2500);
      }
    } catch (err) {
      alert(err.response?.data || "Account not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', backgroundColor: '#020617', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ backgroundColor: '#0f172a', width: '100%', maxWidth: '500px', borderRadius: '40px', padding: '60px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        <Link to="/login" state={{ role }} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', textDecoration: 'none', marginBottom: '40px', fontWeight: '900', fontSize: '12px' }}>
          <ArrowLeft size={16} /> BACK TO LOGIN
        </Link>
        
        <div style={{ width: '80px', height: '80px', backgroundColor: '#6366f120', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', color: '#6366f1', border: '1px solid #6366f140' }}>
          <RefreshCw size={32} />
        </div>

        <h2 style={{ fontSize: '38px', fontWeight: '950', marginBottom: '10px', color: 'white', letterSpacing: '-1px' }}>Recover <span style={{ color: '#6366f1' }}>Access.</span></h2>
        <p style={{ color: '#64748b', fontWeight: '700', marginBottom: '50px' }}>Step-by-step account recovery</p>

        {message && (
          <div style={{ backgroundColor: '#10b98115', border: '1px solid #10b98140', color: '#6ee7b7', padding: '18px', borderRadius: '20px', marginBottom: '40px', fontSize: '14px', fontWeight: '800', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} autoComplete="off">
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', paddingLeft: '5px' }}>Registered Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '20px', padding: '22px 22px 22px 60px', color: 'white', fontSize: '16px', fontWeight: '700', outline: 'none' }} placeholder="Enter email" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', paddingLeft: '5px' }}>New Vault Password</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '20px', padding: '22px 22px 22px 60px', color: 'white', fontSize: '16px', fontWeight: '700', outline: 'none' }} placeholder="Min 8 characters" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: 'white', color: 'black', fontSize: '18px', fontWeight: '950', padding: '24px', borderRadius: '20px', border: 'none', cursor: 'pointer', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
            {loading ? 'DCRYPTING...' : (step === 1 ? 'FIND MY ACCOUNT' : 'SECURE UPDATED KEY')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
