// Disha Sarathi - Full-Screen 40/60 Split Public Portal Login (PS 26097)
import React, { useState, useEffect } from 'react';
import { login, DEMO_ACCOUNTS, UserAccount, UserRole, resetUserPassword } from '../../core/auth';
import { LanguageCode } from '../../core/types';
import { t } from '../../core/i18n';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  onNavigateRegister?: () => void;
  onStartVoice?: () => void;
  initialTab?: 'BENEFICIARY' | 'COORDINATOR' | 'ADMIN';
  lang?: LanguageCode;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  initialTab = 'BENEFICIARY',
  lang = 'mr'
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialTab as UserRole);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'admin') setSelectedRole('ADMIN');
    else if (tabParam === 'coordinator') setSelectedRole('COORDINATOR');
    else if (tabParam === 'beneficiary') setSelectedRole('BENEFICIARY');
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameInput.trim()) {
      setErrorMessage(lang === 'mr' ? 'कृपया आपला मोबाईल क्रमांक किंवा वापरकर्ता नाव प्रविष्ट करा.' : lang === 'hi' ? 'कृपया अपना मोबाइल नंबर या उपयोगकर्ता नाम दर्ज करें।' : 'Please enter your mobile number or username.');
      return;
    }

    const res = login(usernameInput.trim(), passwordInput);
    if (res.success && res.user) {
      if (selectedRole === 'ADMIN' && res.user.role !== 'ADMIN') {
        setErrorMessage(lang === 'mr' ? '⚠️ या खात्याकडे प्रशासक अधिकार नाहीत. कृपया योग्य भूमिका निवडा.' : lang === 'hi' ? '⚠️ इस खाते में व्यवस्थापक अधिकार नहीं हैं।' : '⚠️ This account does not have Admin privileges.');
        return;
      }
      if (selectedRole === 'COORDINATOR' && res.user.role !== 'COORDINATOR' && res.user.role !== 'ADMIN') {
        setErrorMessage(lang === 'mr' ? '⚠️ या खात्याकडे समन्वयक अधिकार नाहीत.' : lang === 'hi' ? '⚠️ इस खाते में समन्वयक अधिकार नहीं हैं।' : '⚠️ This account does not have Coordinator privileges.');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('disha_remember_user', usernameInput.trim());
      } else {
        localStorage.removeItem('disha_remember_user');
      }
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || (lang === 'mr' ? 'लॉगिन अयशस्वी झाले. कृपया आपले तपशील तपासा.' : lang === 'hi' ? 'लॉगिन विफल रहा। कृपया अपना विवरण जांचें।' : 'Login failed. Please check your credentials.'));
    }
  };

  const handleQuickDemoLogin = (demoKey: string) => {
    const demo = DEMO_ACCOUNTS[demoKey];
    if (demo) {
      const res = login(demoKey, demo.passwordHash);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername.trim() || !resetNewPassword.trim()) {
      setResetFeedback(lang === 'mr' ? 'कृपया सर्व माहिती प्रविष्ट करा.' : lang === 'hi' ? 'कृपया सभी जानकारी दर्ज करें।' : 'Please enter all details.');
      return;
    }
    const res = resetUserPassword(resetUsername.trim(), resetNewPassword.trim());
    if (res.success) {
      setResetFeedback(lang === 'mr' ? '✅ पासवर्ड यशस्वीरित्या बदलला आहे! आता नवीन पासवर्डने लॉगिन करा.' : lang === 'hi' ? '✅ पासवर्ड बदल दिया गया है!' : '✅ Password successfully updated!');
      setTimeout(() => {
        setShowResetModal(false);
        setResetFeedback(null);
        setUsernameInput(resetUsername.trim());
        setPasswordInput(resetNewPassword);
      }, 1500);
    } else {
      setResetFeedback(`❌ ${res.message || (lang === 'mr' ? 'वापरकर्ता सापडला नाही' : 'User not found')}`);
    }
  };

  return (
    <div className="login-split-page-wrapper">
      <div className="login-split-container">
        {/* =========================================================================
            LEFT COLUMN (40%): AUTHENTICATION FORM
            ========================================================================= */}
        <div className="login-left-auth-col">
          {/* Brand Header */}
          <div className="auth-brand-identity">
            <span className="auth-brand-icon">🌟</span>
            <div>
              <h1 className="auth-brand-title">{t('appTitle', lang)}</h1>
              <p className="auth-brand-subtitle">
                {t('appSubtitle', lang)}
              </p>
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="auth-role-tabs-bar" role="tablist" aria-label="Select Login Role">
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'BENEFICIARY'}
              className={`auth-role-pill ${selectedRole === 'BENEFICIARY' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('BENEFICIARY');
                setErrorMessage('');
              }}
            >
              <span className="pill-icon">👤</span>
              <span className="pill-text">{t('roleBeneficiary', lang)}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'COORDINATOR'}
              className={`auth-role-pill ${selectedRole === 'COORDINATOR' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('COORDINATOR');
                setErrorMessage('');
              }}
            >
              <span className="pill-icon">📊</span>
              <span className="pill-text">{t('roleCoordinator', lang)}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'ADMIN'}
              className={`auth-role-pill ${selectedRole === 'ADMIN' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('ADMIN');
                setErrorMessage('');
              }}
            >
              <span className="pill-icon">🛡️</span>
              <span className="pill-text">{t('roleAdmin', lang)}</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="auth-alert error" role="alert">
              <span>⚠️</span>
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert success" role="alert">
              <span>✅</span>
              <div>{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="auth-form-fields">
            <div className="auth-field-group">
              <label htmlFor="login-username" className="auth-field-label">
                {t('inputMobileOrUser', lang)}
              </label>
              <div className="auth-input-container">
                <span className="input-prefix-icon">{selectedRole === 'BENEFICIARY' ? '📱' : '✉️'}</span>
                <input
                  id="login-username"
                  type="text"
                  className="auth-text-input"
                  placeholder={t('inputMobilePlaceholder', lang)}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <div className="field-label-row">
                <label htmlFor="login-password" className="auth-field-label">
                  {t('inputPassword', lang)}
                </label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setShowResetModal(true)}
                >
                  {t('forgotPassword', lang)}
                </button>
              </div>

              <div className="auth-input-container">
                <span className="input-prefix-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input"
                  placeholder={t('inputPasswordPlaceholder', lang)}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('rememberMe', lang)}</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" id="btn-login-submit">
              🔐 {t('loginButton', lang)}
            </button>
          </form>

          {/* Quick Demo Accounts Drawer (Collapsible) */}
          <div className="auth-demo-accounts-drawer">
            <details className="demo-accounts-details">
              <summary className="demo-accounts-summary">
                ⚡ {t('demoAccountsTitle', lang)}
              </summary>
              <div className="demo-chips-grid">
                <button
                  type="button"
                  className="demo-account-chip"
                  onClick={() => handleQuickDemoLogin('demo.beneficiary')}
                >
                  <span className="chip-role">👤 {t('roleBeneficiary', lang)}:</span>
                  <span className="chip-name">demo.beneficiary</span>
                </button>

                <button
                  type="button"
                  className="demo-account-chip"
                  onClick={() => handleQuickDemoLogin('demo.coordinator')}
                >
                  <span className="chip-role">📊 {t('roleCoordinator', lang)}:</span>
                  <span className="chip-name">demo.coordinator</span>
                </button>

                <button
                  type="button"
                  className="demo-account-chip"
                  onClick={() => handleQuickDemoLogin('demo.admin')}
                >
                  <span className="chip-role">🛡️ {t('roleAdmin', lang)}:</span>
                  <span className="chip-name">demo.admin</span>
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (60%): ANIMATED VISUAL PANEL
            ========================================================================= */}
        <div className="login-right-visual-col">
          <div className="visual-panel-content" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>

            <div className="panel-authority-tag">
              🏛️ {t('prototypeBadge', lang)}
            </div>

            <h2 className="panel-headline" style={{ whiteSpace: 'pre-line', textAlign: 'center', marginBottom: '4px' }}>
              {t('loginVisualTitle', lang)}
            </h2>

            {/* === ANIMATED SVG ILLUSTRATION === */}
            <div style={{ width: '100%', maxWidth: '420px', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#EFF6FF" />
                    <stop offset="100%" stopColor="#DBEAFE" />
                  </radialGradient>
                  <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F0F9FF" />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Background circle */}
                <circle cx="210" cy="170" r="155" fill="url(#bgGrad)" opacity="0.7" />

                {/* Central Voice Orb with pulse rings */}
                <circle cx="210" cy="155" r="52" fill="url(#orbGrad)" filter="url(#shadow)">
                  <animate attributeName="r" values="52;56;52" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="210" cy="155" r="66" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4">
                  <animate attributeName="r" values="66;80;66" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="210" cy="155" r="80" fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.25">
                  <animate attributeName="r" values="80;96;80" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* Microphone icon inside orb */}
                <rect x="204" y="138" width="12" height="22" rx="6" fill="white" />
                <path d="M199 156 Q199 168 210 168 Q221 168 221 156" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="210" y1="168" x2="210" y2="176" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="204" y1="176" x2="216" y2="176" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

                {/* Sound wave bars left */}
                <rect x="152" y="148" width="5" height="14" rx="2.5" fill="#60A5FA">
                  <animate attributeName="height" values="14;24;14" dur="0.8s" repeatCount="indefinite" />
                  <animate attributeName="y" values="148;143;148" dur="0.8s" repeatCount="indefinite" />
                </rect>
                <rect x="161" y="142" width="5" height="26" rx="2.5" fill="#3B82F6">
                  <animate attributeName="height" values="26;10;26" dur="1.1s" repeatCount="indefinite" />
                  <animate attributeName="y" values="142;150;142" dur="1.1s" repeatCount="indefinite" />
                </rect>
                <rect x="170" y="150" width="5" height="10" rx="2.5" fill="#93C5FD">
                  <animate attributeName="height" values="10;20;10" dur="0.9s" repeatCount="indefinite" />
                  <animate attributeName="y" values="150;145;150" dur="0.9s" repeatCount="indefinite" />
                </rect>

                {/* Sound wave bars right */}
                <rect x="245" y="148" width="5" height="14" rx="2.5" fill="#60A5FA">
                  <animate attributeName="height" values="14;22;14" dur="1.0s" repeatCount="indefinite" />
                  <animate attributeName="y" values="148;144;148" dur="1.0s" repeatCount="indefinite" />
                </rect>
                <rect x="254" y="144" width="5" height="22" rx="2.5" fill="#3B82F6">
                  <animate attributeName="height" values="22;8;22" dur="0.75s" repeatCount="indefinite" />
                  <animate attributeName="y" values="144;152;144" dur="0.75s" repeatCount="indefinite" />
                </rect>
                <rect x="263" y="150" width="5" height="10" rx="2.5" fill="#93C5FD">
                  <animate attributeName="height" values="10;18;10" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="150;146;150" dur="1.2s" repeatCount="indefinite" />
                </rect>

                {/* Step 1 card — Voice */}
                <rect x="20" y="24" width="108" height="58" rx="12" fill="url(#cardGrad)" filter="url(#shadow)" />
                <text x="74" y="46" textAnchor="middle" fontSize="18" fontFamily="system-ui">🎙️</text>
                <text x="74" y="62" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1E3A8A" fontFamily="system-ui">
                  {lang === 'en' ? 'Voice Input' : lang === 'hi' ? 'आवाज़ इनपुट' : 'आवाज इनपुट'}
                </text>
                <text x="74" y="75" textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="system-ui">
                  {lang === 'en' ? '7 Languages' : lang === 'hi' ? '७ भाषाएं' : '७ भाषा'}
                </text>
                {/* Arrow 1 */}
                <path d="M130 53 L155 100" stroke="#93C5FD" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arr)" opacity="0.7" />

                {/* Step 2 card — AI */}
                <rect x="156" y="228" width="108" height="58" rx="12" fill="url(#cardGrad)" filter="url(#shadow)" />
                <text x="210" y="250" textAnchor="middle" fontSize="18" fontFamily="system-ui">🎯</text>
                <text x="210" y="266" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1E3A8A" fontFamily="system-ui">
                  {lang === 'en' ? 'AI Profiling' : lang === 'hi' ? 'AI प्रोफाइलिंग' : 'AI प्रोफाइलिंग'}
                </text>
                <text x="210" y="279" textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="system-ui">NSQF Level 4</text>
                {/* Arrow 2 */}
                <path d="M265 100 L290 53" stroke="#93C5FD" strokeWidth="2" strokeDasharray="5,3" opacity="0.7" />

                {/* Step 3 card — Job */}
                <rect x="292" y="24" width="108" height="58" rx="12" fill="url(#cardGrad)" filter="url(#shadow)" />
                <text x="346" y="46" textAnchor="middle" fontSize="18" fontFamily="system-ui">💼</text>
                <text x="346" y="62" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1E3A8A" fontFamily="system-ui">
                  {lang === 'en' ? 'Placement' : lang === 'hi' ? 'नियुक्ति' : 'नियुक्ती'}
                </text>
                <text x="346" y="75" textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="system-ui">
                  {lang === 'en' ? 'Govt. Linked' : lang === 'hi' ? 'सरकारी जुड़ाव' : 'शासकीय जोड'}
                </text>

                {/* Floating badge — Skill Passport */}
                <rect x="22" y="240" width="100" height="36" rx="10" fill="#ECFDF5" stroke="#86EFAC" strokeWidth="1.5" />
                <text x="72" y="256" textAnchor="middle" fontSize="10" fontFamily="system-ui">🪪</text>
                <text x="85" y="256" textAnchor="middle" fontSize="9" fontWeight="700" fill="#166534" fontFamily="system-ui">Skill Passport</text>
                <text x="72" y="270" textAnchor="middle" fontSize="8" fill="#4ADE80" fontFamily="system-ui">Blockchain Verified</text>

                {/* Floating badge — Secure */}
                <rect x="298" y="240" width="100" height="36" rx="10" fill="#FFF7ED" stroke="#FCD34D" strokeWidth="1.5" />
                <text x="348" y="256" textAnchor="middle" fontSize="10" fontFamily="system-ui">🛡️</text>
                <text x="348" y="268" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400E" fontFamily="system-ui">DPDP 2023</text>

                {/* Floating dot accents */}
                <circle cx="60" cy="170" r="4" fill="#BFDBFE" opacity="0.8">
                  <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="360" cy="170" r="4" fill="#BFDBFE" opacity="0.8">
                  <animate attributeName="r" values="4;6;4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="210" cy="40" r="5" fill="#FCD34D" opacity="0.6">
                  <animate attributeName="cy" values="40;35;40" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            {/* Trust Badges Row */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#1E40AF' }}>
                🇮🇳 PM-AJAY GIA
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '20px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>
                ✅ {lang === 'en' ? 'NSQF Certified' : 'NSQF प्रमाणित'}
              </div>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '20px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#92400E' }}>
                🛡️ DPDP 2023
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '420px', background: '#FFFFFF', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>{t('forgotPassword', lang)}</h3>
              <button
                type="button"
                className="btn-ctrl"
                onClick={() => {
                  setShowResetModal(false);
                  setResetFeedback(null);
                }}
              >
                ✕
              </button>
            </div>

            {resetFeedback && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', background: resetFeedback.includes('✅') ? '#DCFCE7' : '#FEE2E2', color: resetFeedback.includes('✅') ? '#166534' : '#991B1B' }}>
                {resetFeedback}
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  {t('inputMobileOrUser', lang)}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="demo.beneficiary"
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  {lang === 'mr' ? 'नवीन पासवर्ड:' : lang === 'hi' ? 'नया पासवर्ड:' : 'New Password:'}
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                {lang === 'mr' ? 'पासवर्ड बदला' : lang === 'hi' ? 'पासवर्ड बदलें' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
