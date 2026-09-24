// Disha Sarathi - Global Application Footer (PS 26097)
import React from 'react';
import { LanguageCode } from '../../core/types';
import { t } from '../../core/i18n';

interface AppFooterProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onNavigate: (path: string) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  selectedLanguage,
  onLanguageChange,
  onNavigate
}) => {
  const lang = selectedLanguage || 'mr';

  return (
    <footer className="global-app-footer">
      <div className="footer-top-grid">
        {/* Brand Summary */}
        <div className="footer-col brand-col">
          <div className="footer-brand-title">
            <span>🌟</span> <strong>{t('appTitle', lang)}</strong>
          </div>
          <p className="footer-brand-desc">
            {t('appSubtitle', lang)}
          </p>
          <div className="footer-statutory-pill">
            🏛️ {t('authorityBanner', lang)}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col links-col">
          <h4>{lang === 'mr' ? 'महत्वाच्या लिंक्स' : lang === 'hi' ? 'महत्वपूर्ण लिंक्स' : 'Quick Links'}</h4>
          <ul>
            <li><button type="button" onClick={() => onNavigate('/')}>{t('navHome', lang)}</button></li>
            <li><button type="button" onClick={() => onNavigate('/talk')}>{t('serviceVoiceTitle', lang)}</button></li>
            <li><button type="button" onClick={() => onNavigate('/help')}>{t('navHelp', lang)}</button></li>
            <li><button type="button" onClick={() => onNavigate('/contact')}>{t('navContact', lang)}</button></li>
            <li><button type="button" onClick={() => onNavigate('/diagnostics')}>{lang === 'mr' ? 'प्रणाली चाचणी' : lang === 'hi' ? 'सिस्टम परीक्षण' : 'Diagnostics'}</button></li>
          </ul>
        </div>

        {/* Support & Privacy */}
        <div className="footer-col support-col">
          <h4>{lang === 'mr' ? 'गोपनीयता व सुरक्षा' : lang === 'hi' ? 'गोपनीयता व सुरक्षा' : 'Privacy & Security'}</h4>
          <ul>
            <li><button type="button" onClick={() => onNavigate('/help#privacy')}>{lang === 'mr' ? 'DPDP Act २०२३ गोपनीयता धोरण' : lang === 'hi' ? 'DPDP Act 2023 गोपनीयता नीति' : 'DPDP Act 2023 Privacy Policy'}</button></li>
            <li><button type="button" onClick={() => onNavigate('/help#data-deletion')}>{lang === 'mr' ? 'माझा डेटा हटवण्याचा अधिकार' : lang === 'hi' ? 'डेटा हटाने का अधिकार' : 'Right to Erasure'}</button></li>
            <li><button type="button" onClick={() => onNavigate('/help#verification')}>{lang === 'mr' ? 'पडताळणी प्रक्रिया' : lang === 'hi' ? 'सत्यापन प्रक्रिया' : 'Verification Policy'}</button></li>
          </ul>
        </div>

        {/* Language Selection & Helpline */}
        <div className="footer-col lang-col">
          <h4>{lang === 'mr' ? 'भाषा' : lang === 'hi' ? 'भाषा' : 'Language'}</h4>
          <div className="footer-lang-chips">
            {[
              { code: 'mr', name: 'मराठी' },
              { code: 'hi', name: 'हिन्दी' },
              { code: 'en', name: 'English' }
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                className={`footer-lang-btn ${selectedLanguage === l.code ? 'active' : ''}`}
                onClick={() => onLanguageChange(l.code as LanguageCode)}
              >
                {l.name}
              </button>
            ))}
          </div>

          <div className="footer-pstn-box" style={{ marginTop: '14px' }}>
            <small style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>{t('helplineLabel', lang)}</small>
            <strong style={{ color: 'var(--field)', fontSize: '1rem' }}>📞 +917965480255</strong>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-disclaimer">
          ℹ️ <strong>{t('passportNotice', lang)}</strong>
        </p>
        <div className="footer-copyright">
          © {new Date().getFullYear()} {t('appTitle', lang)} • PM-AJAY GIA Component (SIH PS 26097).
        </div>
      </div>
    </footer>
  );
};
