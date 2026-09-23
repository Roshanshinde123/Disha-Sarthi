// Disha Sarathi - User Registration View (PS 26097)
import React, { useState } from 'react';
import { createUser, UserRole, UserAccount } from '../../core/auth';

interface RegisterViewProps {
  onRegisterSuccess: (user: UserAccount) => void;
  onNavigateLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateLogin
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('BENEFICIARY');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const districtsList = [
    'Pune', 'Nagpur', 'Nanded', 'Amravati', 'Solapur',
    'Aurangabad', 'Nashik', 'Thane', 'Kolhapur', 'Latur', 'Jalgaon'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('पासवर्ड आणि कन्फर्म पासवर्ड जुळत नाहीत (Passwords do not match).');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('पासवर्ड किमान 4 अक्षरांचा असावा (Password must be at least 4 characters).');
      return;
    }

    const res = createUser(
      {
        username: username.trim(),
        role,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        district,
        state,
        status: 'ACTIVE'
      },
      password,
      'self-registration'
    );

    if (res.success && res.user) {
      onRegisterSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <div className="login-viewport" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '24px' }}>
      <div className="login-card" style={{ maxWidth: '540px', width: '100%', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', padding: '32px', boxSizing: 'border-box' }}>
        {/* Brand Header */}
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="login-logo" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>📝</div>
          <h1 className="login-title" style={{ margin: 0, fontSize: '1.5rem', color: '#0F172A', fontWeight: 800 }}>
            नवीन खाते नोंदणी (New Registration)
          </h1>
          <p className="login-subtitle" style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
            PM-AJAY GIA Component • Livelihood & NSQF Skilling System
          </p>
        </div>

        {errorMessage && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
              भूमिका निवडा (Select Role):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('BENEFICIARY')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'BENEFICIARY' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  background: role === 'BENEFICIARY' ? '#EFF6FF' : '#FFFFFF',
                  color: role === 'BENEFICIARY' ? '#1E40AF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                👤 लाभार्थी (Beneficiary)
              </button>
              <button
                type="button"
                onClick={() => setRole('COORDINATOR')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'COORDINATOR' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  background: role === 'COORDINATOR' ? '#EFF6FF' : '#FFFFFF',
                  color: role === 'COORDINATOR' ? '#1E40AF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                📋 GIA समन्वयक (Coordinator)
              </button>
            </div>
          </div>

          {/* Full Name & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                पूर्ण नाव (Full Name):
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kamble"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                वापरकर्ता नाव (Username):
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ramesh.k"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                मोबाईल नंबर (Phone):
              </label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                ईमेल (Email, optional):
              </label>
              <input
                type="email"
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* District & State */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                जिल्हा (District):
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', background: '#FFF', boxSizing: 'border-box' }}
              >
                {districtsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                राज्य (State):
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                पासवर्ड (Password):
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                पासवर्ड पुन्हा प्रविष्ट करा:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              पासवर्ड दाखवा (Show Password)
            </label>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            नोंदणी पूर्ण करा (Complete Registration) →
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.88rem', color: '#64748B' }}>
          आधीच खाते आहे का?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            येथे लॉगिन करा (Login)
          </button>
        </div>
      </div>
    </div>
  );
};
