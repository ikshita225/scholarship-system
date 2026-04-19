import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [otpPopup, setOtpPopup] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    
    const navigate = useNavigate();

    const initiateOtp = async () => {
        if (!name || !email || !password) { alert("ENTER ALL DETAILS FIRST."); return; }
        try {
            const res = await axios.post('https://scholarship-backend-qbkn.onrender.com/api/auth/send-otp', { email });
            setGeneratedOtp(res.data.otp);
            setOtpPopup(true);
        } catch (err) {
            alert("Failed to secure connection for OTP: " + (err.response?.data?.message || "Network Error"));
        }
    };

    const handleRegister = async () => {
        if (enteredOtp !== generatedOtp) { alert("INVALID OTP CODE."); return; }
        
        try {
            await axios.post('https://scholarship-backend-qbkn.onrender.com/api/auth/signup', { name, email, password, role: 'STUDENT', otp: enteredOtp });
            alert("STUDENT ENROLLMENT SUCCESSFUL! PROCEED TO MANUAL LOGIN.");
            navigate('/login', { state: { role: 'STUDENT' } });
        } catch (err) {
            alert("Registration failed: " + (err.response?.data?.message || err.message || "Network Error"));
        }
    };

    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                   <div style={{ width: '80px', height: '80px', backgroundColor: '#6366f115', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #6366f130' }}>
                      <User size={40} color="#6366f1" />
                   </div>
                   <h1 style={{ fontSize: '38px', fontWeight: '950', marginBottom: '10px' }}>Student <span style={{ color: '#6366f1' }}>Enrollment.</span></h1>
                   <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '950', letterSpacing: '2px' }}>OFFICIAL SCHOLARSHIP CANDIDATE REGISTRATION</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input name="name" placeholder="FULL LEGAL NAME" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '22px 60px 22px 60px', borderRadius: '18px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', fontWeight: '800', fontSize: '18px' }} required autoComplete="off" />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input name="email" type="email" placeholder="OFFICIAL EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '22px 60px 22px 60px', borderRadius: '18px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', fontWeight: '800', fontSize: '18px' }} required autoComplete="off" />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input name="password" type="password" placeholder="CREATE SECURITY KEY" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '22px 60px 22px 60px', borderRadius: '18px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', fontWeight: '800', fontSize: '18px' }} required autoComplete="new-password" />
                    </div>

                    <button onClick={initiateOtp} style={{ padding: '22px', backgroundColor: '#6366f1', color: 'white', borderRadius: '18px', border: 'none', cursor: 'pointer', fontWeight: '950', fontSize: '18px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        GENERATE OTP <ShieldCheck size={20} />
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '13px', fontWeight: '950' }}>
                    RECORD EXISTS? <Link to="/login?role=STUDENT" style={{ color: '#6366f1', textDecoration: 'none' }}>LOG IN MANUALLY</Link>
                </p>

                {/* OTP POPUP (Idea from User) */}
                {otpPopup && (
                  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(20px)' }}>
                     <div style={{ backgroundColor: '#0f172a', padding: '60px', borderRadius: '50px', width: '100%', maxWidth: '500px', border: '1px solid #1e293b', textAlign: 'center shadow' }}>
                        <ShieldCheck size={64} color="#10b981" style={{ margin: '0 auto 30px' }} />
                        <h2 style={{ fontSize: '30px', fontWeight: '950', marginBottom: '10px' }}>SECURITY POP-UP</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px', fontWeight: '900' }}>YOUR IDENTITY CODE IS:</p>
                        
                        <div style={{ padding: '20px', backgroundColor: '#020617', borderRadius: '25px', marginBottom: '40px', border: '1px solid #10b98140' }}>
                           <h1 style={{ fontSize: '48px', fontWeight: '950', color: '#10b981', letterSpacing: '8px' }}>{generatedOtp}</h1>
                        </div>

                        <input 
                           placeholder="TYPE CODE HERE" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} 
                           style={{ width: '100%', padding: '22px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '20px', color: 'teal', fontWeight: '950', fontSize: '32px', textAlign: 'center', letterSpacing: '8px', marginBottom: '30px' }} 
                        />

                        <button onClick={handleRegister} style={{ width: '100%', padding: '25px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '25px', fontSize: '20px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                           DONE <CheckCircle2 size={24} />
                        </button>
                        <button onClick={() => setOtpPopup(false)} style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '20px', fontWeight: '950', cursor: 'pointer' }}>CANCEL</button>
                     </div>
                  </div>
                )}
            </div>
        </div>
    );
};

export default Register;
