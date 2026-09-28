// Disha Sarathi - Public-Service Government Portal Header (PS 26097)
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, UserRole } from '../../core/auth';
import { LanguageCode } from '../../core/types';

export interface AppHeaderProps {
  currentPath: string;
  currentUser?: UserAccount | null;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onNavigate: (path: string) => void;
  onStartVoice: () => void;
  onLogout?: () => void;
}

const LANGUAGES: { code: LanguageCode; name: string; native: string; flag: string }[] = [
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', flag: '🌐' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'od', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' }
];

const NAV_LABELS: Record<string, {
  home: string;
  about: string;
  howItWorks: string;
  help: string;
  contact: string;
  profile: string;
  voice: string;
  passport: string;
  recommendations: string;
  training: string;
  placement: string;
  adminDashboard: string;
  coordinatorDashboard: string;
  beneficiaries: string;
  verification: string;
  analytics: string;
  telephony: string;
  login: string;
  logout: string;
}> = {
  mr: {
    home: 'मुख्य पृष्ठ',
    about: 'दिशा सारथी विषयी',
    howItWorks: 'कसे कार्य करते',
    help: 'मदत व FAQ',
    contact: 'संपर्क',
    profile: 'माझे प्रोफाईल',
    voice: 'व्हॉईस असिस्टंट',
    passport: 'स्किल पासपोर्ट',
    recommendations: 'रोजगार शिफारसी',
    training: 'प्रशिक्षण केंद्रे',
    placement: 'रोजगार व पुरावा',
    adminDashboard: 'प्रशासक डॅशबोर्ड',
    coordinatorDashboard: 'समन्वयक डॅशबोर्ड',
    beneficiaries: 'लाभार्थी यादी',
    verification: 'पडताळणी',
    analytics: 'अनालिटिक्स',
    telephony: 'टेलिफोनी',
    login: 'लॉगिन',
    logout: 'लॉगआउट'
  },
  hi: {
    home: 'मुख्य पृष्ठ',
    about: 'दिशा सारथी के बारे में',
    howItWorks: 'यह कैसे काम करता है',
    help: 'सहायता एवं FAQ',
    contact: 'संपर्क',
    profile: 'मेरी प्रोफाइल',
    voice: 'वॉइस असिस्टेंट',
    passport: 'स्किल पासपोर्ट',
    recommendations: 'रोजगार सिफारिशें',
    training: 'प्रशिक्षण केंद्र',
    placement: 'रोजगार एवं साक्ष्य',
    adminDashboard: 'प्रशासक डैशबोर्ड',
    coordinatorDashboard: 'समन्वयक डैशबोर्ड',
    beneficiaries: 'लाभार्थी सूची',
    verification: 'सत्यापन',
    analytics: 'एनालिटिक्स',
    telephony: 'टेलीफोनी',
    login: 'लॉगिन',
    logout: 'लॉगआउट'
  },
  en: {
    home: 'Home',
    about: 'About',
    howItWorks: 'How It Works',
    help: 'Help & FAQ',
    contact: 'Contact Us',
    profile: 'My Profile',
    voice: 'Voice Assistant',
    passport: 'Skill Passport',
    recommendations: 'Recommendations',
    training: 'Training Centres',
    placement: 'Placement',
    adminDashboard: 'Admin Dashboard',
    coordinatorDashboard: 'Coordinator Dashboard',
    beneficiaries: 'Beneficiaries',
    verification: 'Verification',
    analytics: 'Analytics',
    telephony: 'Telephony',
    login: 'Login',
    logout: 'Logout'
  }
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentPath,
  currentUser,
  selectedLanguage,
  onLanguageChange,
  onNavigate,
  onStartVoice,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role: UserRole | 'PUBLIC' = currentUser && currentUser.role ? currentUser.role : 'PUBLIC';
  const labels = NAV_LABELS[selectedLanguage] || NAV_LABELS.mr;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNavLinks = () => {
    if (role === 'BENEFICIARY') {
      return [
        { label: labels.home, path: '/beneficiary' },
        { label: labels.profile, path: '/beneficiary/profile' },
        { label: labels.voice, path: '/talk' },
        { label: labels.passport, path: '/beneficiary/skill-passport' },
        { label: labels.recommendations, path: '/beneficiary/recommendations' },
        { label: labels.training, path: '/beneficiary/training' },
        { label: labels.placement, path: '/beneficiary/placement' },
        { label: labels.help, path: '/help' }
      ];
    }

    if (role === 'ADMIN') {
      return [
        { label: labels.adminDashboard, path: '/admin' },
        { label: labels.beneficiaries, path: '/coordinator/beneficiaries' },
        { label: labels.training, path: '/coordinator/training' },
        { label: labels.verification, path: '/coordinator/verification' },
        { label: labels.analytics, path: '/coordinator/analytics' },
        { label: selectedLanguage === 'mr' ? 'प्रणाली चाचणी' : selectedLanguage === 'hi' ? 'सिस्टम परीक्षण' : 'Diagnostics', path: '/diagnostics' },
        { label: labels.help, path: '/help' }
      ];
    }

    if (role === 'COORDINATOR') {
      return [
        { label: labels.coordinatorDashboard, path: '/coordinator' },
        { label: labels.beneficiaries, path: '/coordinator/beneficiaries' },
        { label: labels.training, path: '/coordinator/training' },
        { label: labels.verification, path: '/coordinator/verification' },
        { label: labels.analytics, path: '/coordinator/analytics' },
        { label: labels.help, path: '/help' }
      ];
    }

    return [
      { label: labels.home, path: '/' },
      { label: labels.about, path: '/#about' },
      { label: labels.howItWorks, path: '/#how-it-works' },
      { label: labels.help, path: '/help' },
      { label: labels.contact, path: '/contact' }
    ];
  };

  const navLinks = getNavLinks();

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const el = document.getElementById(path.replace('/#', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(path.replace('/#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <header className="gov-header-wrapper" role="banner">
      {/* Top Prototype Authority Bar */}
      <div className="gov-top-authority-bar">
        <div className="gov-top-container">
          <span className="gov-top-title">
            Ministry of Social Justice & Empowerment • PM-AJAY
          </span>
          <span className="gov-top-badge">AI Skilling & Livelihood</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="gov-main-header-bar">
        <div className="gov-header-container">
          {/* Brand & Identity */}
          <div
            className="gov-brand-identity"
            onClick={() => handleLinkClick(role === 'ADMIN' ? '/admin' : role === 'COORDINATOR' ? '/coordinator' : role === 'BENEFICIARY' ? '/beneficiary' : '/')}
            role="button"
            tabIndex={0}
            aria-label="Go to Home"
          >
            <div className="gov-brand-emblem" style={{ background: '#1F6F4A', color: '#FFF', borderRadius: '8px', padding: '4px 8px', fontWeight: 800, fontSize: '1rem' }}>
              DS
            </div>
            <div className="gov-brand-text-block">
              <div className="gov-brand-title">
                दिशा सारथी <span className="gov-brand-en">• Disha Sarathi</span>
              </div>
              <div className="gov-brand-desc">
                {selectedLanguage === 'mr' ? 'एआय व्हॉईस कौशल्य व रोजगार मार्गदर्शन प्रणाली' : selectedLanguage === 'hi' ? 'एआई वॉयस कौशल एवं रोजगार मार्गदर्शन प्रणाली' : 'Multilingual AI Skilling & Livelihood Guidance'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="gov-nav-menu" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && !link.path.startsWith('/#') && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  type="button"
                  className={`gov-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick(link.path)}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Tools: Single Language Dropdown + Login/User Menu */}
          <div className="gov-action-tools">
            {/* Single Language Dropdown */}
            <div className="gov-language-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="gov-lang-select-trigger"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-expanded={langDropdownOpen}
                aria-label="Select Language"
              >
                <span className="lang-label">{currentLang.native}</span>
                <span className="lang-arrow" style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
              </button>

              {langDropdownOpen && (
                <div className="gov-lang-dropdown-menu" role="menu">
                  <div className="lang-menu-caption">भाषा निवडा / Language</div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="menuitem"
                      className={`lang-option-item ${selectedLanguage === l.code ? 'selected' : ''}`}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                    >
                      <span className="opt-native">{l.native}</span>
                      <span className="opt-en">({l.name})</span>
                      {selectedLanguage === l.code && <span className="opt-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authentication / Role CTA */}
            {currentUser ? (
              <div className="gov-auth-user-box">
                <div className="user-info-pill">
                  <div className="user-details">
                    <span className="user-display-name">{currentUser.name.split(' ')[0]}</span>
                    <span className="user-role-badge">{currentUser.role}</span>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    className="gov-signout-btn"
                    onClick={onLogout}
                    title={labels.logout}
                    aria-label="Logout"
                  >
                    {labels.logout}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="gov-signin-btn"
                onClick={() => onNavigate('/login')}
              >
                {labels.login}
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="gov-hamburger-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="gov-mobile-nav-drawer" role="dialog" aria-modal="true">
          <div className="drawer-top-bar">
            <span className="drawer-heading">{selectedLanguage === 'mr' ? 'मेन्यू' : selectedLanguage === 'hi' ? 'मेनू' : 'Menu'}</span>
            <button
              type="button"
              className="drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="drawer-content-body">
            {/* Language Segmented Control on Mobile */}
            <div className="drawer-lang-selector">
              <span className="drawer-lang-title">{selectedLanguage === 'mr' ? 'भाषा:' : 'Language:'}</span>
              <div className="drawer-lang-chips-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`drawer-lang-chip ${selectedLanguage === l.code ? 'active' : ''}`}
                    onClick={() => {
                      onLanguageChange(l.code);
                    }}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <div className="drawer-nav-items">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  className={`drawer-nav-btn ${currentPath === link.path ? 'active' : ''}`}
                  onClick={() => handleLinkClick(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Drawer Footer CTA */}
            <div className="drawer-actions-footer">
              <button
                type="button"
                className="drawer-voice-cta"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartVoice();
                }}
              >
                {selectedLanguage === 'mr' ? 'दिशा सारथीशी बोला' : selectedLanguage === 'hi' ? 'दिशा सारथी से बात करें' : 'Talk to Disha Sarathi'}
              </button>
              {currentUser ? (
                <button
                  type="button"
                  className="drawer-logout-cta"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                >
                  {labels.logout} ({currentUser.name})
                </button>
              ) : (
                <button
                  type="button"
                  className="drawer-login-cta"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/login');
                  }}
                >
                  {labels.login}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
