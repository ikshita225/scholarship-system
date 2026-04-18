import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, ShieldCheck, UserCog } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-card m-3 py-3 flex items-center justify-between" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck className="text-indigo-500" />
        <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-2px', textDecoration: 'none' }}>
          Scholar<span style={{ color: 'var(--primary)' }}>Path</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="nav-link flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
          <Home size={22} /> Home
        </Link>

        {user ? (
          <>
            {user.role === 'STUDENT' && (
              <Link to="/student" className="nav-link flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
                <User size={22} /> Dashboard
              </Link>
            )}
            {user.role === 'VERIFIER' && (
              <Link to="/verifier" className="nav-link flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
                <ShieldCheck size={22} /> Verifier Panel
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
                <UserCog size={22} /> Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="btn-outline flex items-center gap-2 px-6 py-2.5 rounded-xl" style={{ fontSize: '18px', fontWeight: '800' }}>
              <LogOut size={22} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary flex items-center gap-1 px-4 py-2 rounded-lg">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
