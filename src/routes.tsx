// Disha Sarathi - Application Router & Unified App Shell (PS 26097)
import React, { useState, useEffect } from 'react';
import { VoicePwa } from './channels/VoicePwa';
import { WhatsAppSim } from './channels/WhatsAppSim';
import { IvrSim } from './channels/IvrSim';
import { CoordinatorDashboard, CoordinatorTab } from './ui/dashboard/CoordinatorDashboard';
import { AdminDashboard, AdminTab } from './ui/admin/AdminDashboard';
import { BeneficiaryDashboard, BeneficiaryTab } from './ui/beneficiary/BeneficiaryDashboard';
import { VoiceConversationView } from './ui/beneficiary/VoiceConversationView';
import { MyJourneyView } from './ui/beneficiary/MyJourneyView';
import { ResumeCardView } from './ui/beneficiary/ResumeCardView';
import { LoginView } from './ui/auth/LoginView';
import { RegisterView } from './ui/auth/RegisterView';
import { DiagnosticsView } from './ui/diagnostics/DiagnosticsView';
import { LandingPage } from './ui/landing/LandingPage';
import { HelpView } from './ui/pages/HelpView';
import { ContactView } from './ui/pages/ContactView';
import { AppHeader } from './ui/components/AppHeader';
import { AppFooter } from './ui/components/AppFooter';
import { getStoredAuth, logout, canAccessRoute, UserAccount } from './core/auth';
import { loadActiveSession, saveCurrentSession } from './core/store';
import { createInitialSession } from './core/orchestrator';
import { LanguageCode, Session } from './core/types';

export const AppRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [auth, setAuth] = useState(getStoredAuth());
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('mr');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    loadActiveSession().then((stored) => {
      if (stored) {
        setActiveSession(stored);
        if (stored.lang) setSelectedLanguage(stored.lang);
      } else {
        const initial = createInitialSession('mr');
        setActiveSession(initial);
      }
    });
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    if (activeSession) {
      const updated = { ...activeSession, lang };
      setActiveSession(updated);
      saveCurrentSession(updated);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setAuth({ isAuthenticated: true, currentUser: user });
    if (user.role === 'ADMIN') {
      navigateTo('/admin');
    } else if (user.role === 'COORDINATOR') {
      navigateTo('/coordinator');
    } else {
      navigateTo('/beneficiary');
    }
  };

  const handleLogout = () => {
    logout();
    setAuth({ isAuthenticated: false, currentUser: null });
    navigateTo('/login');
  };

  // Route Guard Check
  const isAllowed = canAccessRoute(auth.currentUser?.role, currentPath);
  if (!isAllowed && auth.isAuthenticated) {
    if (auth.currentUser?.role === 'BENEFICIARY') {
      return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <AppHeader
            currentPath={currentPath}
            currentUser={auth.currentUser}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onNavigate={navigateTo}
            onStartVoice={() => navigateTo('/talk')}
            onLogout={handleLogout}
          />
          <div style={{ padding: '60px 20px', textAlign: 'center', flex: 1 }}>
            <h2>⚠️ अनधिकृत प्रवेश (Unauthorized Access)</h2>
            <p style={{ color: '#64748B', marginBottom: '20px' }}>तुम्हाला या पृष्ठावर प्रवेश करण्याची परवानगी नाही.</p>
            <button className="btn-primary" onClick={() => navigateTo('/beneficiary')}>
              माझ्या डॅशबोर्डवर जा (Go to Beneficiary Dashboard)
            </button>
          </div>
          <AppFooter selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} onNavigate={navigateTo} />
        </div>
      );
    }
    if (auth.currentUser?.role === 'COORDINATOR') {
      return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <AppHeader
            currentPath={currentPath}
            currentUser={auth.currentUser}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onNavigate={navigateTo}
            onStartVoice={() => navigateTo('/talk')}
            onLogout={handleLogout}
          />
          <div style={{ padding: '60px 20px', textAlign: 'center', flex: 1 }}>
            <h2>⚠️ अनधिकृत प्रवेश (Unauthorized Access)</h2>
            <p style={{ color: '#64748B', marginBottom: '20px' }}>या पृष्ठासाठी प्रशासक (Admin) अधिकारांची आवश्यकता आहे.</p>
            <button className="btn-primary" onClick={() => navigateTo('/coordinator')}>
              समन्वयक डॅशबोर्डवर जा (Go to Coordinator Dashboard)
            </button>
          </div>
          <AppFooter selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} onNavigate={navigateTo} />
        </div>
      );
    }
  }

  // Render Page Content inside Shell
  const renderPageContent = () => {
    // 1. Help & Contact Pages
    if (currentPath === '/help') {
      return <HelpView onStartVoice={() => navigateTo('/talk')} onNavigateLogin={() => navigateTo('/login')} />;
    }

    if (currentPath === '/contact') {
      return (
        <ContactView
          lang={selectedLanguage}
          onStartVoice={() => navigateTo('/talk')}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // 2. Public / Scanned Resume Card (/resume/:token or /beneficiary/resume/:token)
    if (currentPath.startsWith('/resume/') || currentPath.startsWith('/beneficiary/resume/')) {
      const token = currentPath.split('/').pop() || '';
      return <ResumeCardView token={token} onNavigateHome={() => navigateTo('/')} onStartVoice={() => navigateTo('/talk')} />;
    }

    // 3. Auth Routes
    if (currentPath === '/login') {
      return (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onNavigateRegister={() => navigateTo('/register')}
          onStartVoice={() => navigateTo('/talk')}
          lang={selectedLanguage}
        />
      );
    }

    if (currentPath === '/register') {
      return (
        <RegisterView
          onRegisterSuccess={handleLoginSuccess}
          onNavigateLogin={() => navigateTo('/login')}
        />
      );
    }

    // 4. Admin Routes
    if (currentPath.startsWith('/admin')) {
      if (!auth.isAuthenticated || auth.currentUser?.role !== 'ADMIN') {
        return (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => navigateTo('/register')}
            onStartVoice={() => navigateTo('/talk')}
            initialTab="ADMIN"
            lang={selectedLanguage}
          />
        );
      }

      let initialTab: AdminTab = 'overview';
      if (currentPath.includes('/users')) initialTab = 'users';
      else if (currentPath.includes('/roles')) initialTab = 'roles';
      else if (currentPath.includes('/providers')) initialTab = 'providers';
      else if (currentPath.includes('/system')) initialTab = 'system';
      else if (currentPath.includes('/audit')) initialTab = 'audit';
      else if (currentPath.includes('/diagnostics')) initialTab = 'diagnostics';

      return (
        <AdminDashboard
          initialTab={initialTab}
          onLogout={handleLogout}
          onNavigateToCoordinator={() => navigateTo('/coordinator')}
          onNavigateToBeneficiary={() => navigateTo('/beneficiary')}
        />
      );
    }

    // 5. Coordinator Routes
    if (currentPath.startsWith('/coordinator') || currentPath === '/dashboard') {
      if (!auth.isAuthenticated || (auth.currentUser?.role !== 'COORDINATOR' && auth.currentUser?.role !== 'ADMIN')) {
        return (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => navigateTo('/register')}
            onStartVoice={() => navigateTo('/talk')}
            lang={selectedLanguage}
          />
        );
      }

      let initialTab: CoordinatorTab = 'map';
      if (currentPath.includes('/beneficiaries') || currentPath.includes('/beneficiary/')) initialTab = 'beneficiaries';
      else if (currentPath.includes('/verification')) initialTab = 'verification';
      else if (currentPath.includes('/training')) initialTab = 'training';
      else if (currentPath.includes('/placements')) initialTab = 'placements';
      else if (currentPath.includes('/follow-up')) initialTab = 'follow_up';
      else if (currentPath.includes('/recommendations')) initialTab = 'matrix';
      else if (currentPath.includes('/analytics')) initialTab = 'analytics';
      else if (currentPath.includes('/map')) initialTab = 'map';

      return (
        <CoordinatorDashboard
          initialTab={initialTab}
          onLogout={handleLogout}
          onNavigateToBeneficiary={() => navigateTo('/beneficiary')}
          onNavigateToAdmin={auth.currentUser?.role === 'ADMIN' ? () => navigateTo('/admin') : undefined}
        />
      );
    }

    // 6. Beneficiary Routes
    if (currentPath === '/beneficiary/journey' && activeSession) {
      return (
        <MyJourneyView
          session={{ ...activeSession, lang: selectedLanguage }}
          onNavigate={navigateTo}
          onStartVoice={() => navigateTo('/talk')}
        />
      );
    }

    if (currentPath === '/beneficiary/voice' && activeSession) {
      return (
        <VoiceConversationView
          session={{ ...activeSession, lang: selectedLanguage }}
          onEvent={(_e) => {}}
          onSwitchLang={handleLanguageChange}
          onNavigate={navigateTo}
          onEndVoice={() => navigateTo('/beneficiary')}
        />
      );
    }

    if (currentPath.startsWith('/beneficiary') && activeSession) {
      let initialTab: BeneficiaryTab = 'OVERVIEW';
      if (currentPath.includes('/profile')) initialTab = 'PROFILE';
      else if (currentPath.includes('/skill-passport')) initialTab = 'PASSPORT';
      else if (currentPath.includes('/skill-gap')) initialTab = 'SKILL_GAP';
      else if (currentPath.includes('/recommendations') || currentPath.includes('/pathway')) initialTab = 'RECOMMENDATIONS';
      else if (currentPath.includes('/training')) initialTab = 'TRAINING';
      else if (currentPath.includes('/placement')) initialTab = 'PLACEMENT';
      else if (currentPath.includes('/follow-up')) initialTab = 'FOLLOW_UP';
      else if (currentPath.includes('/finance')) initialTab = 'FINANCE';
      else if (currentPath.includes('/aspiration-card')) initialTab = 'CARD';
      else if (currentPath.includes('/journey')) initialTab = 'JOURNEY';

      return (
        <BeneficiaryDashboard
          session={{ ...activeSession, lang: selectedLanguage }}
          initialTab={initialTab}
          onStartVoice={() => navigateTo('/talk')}
          onLogout={handleLogout}
          onUpdateSession={(updated) => {
            const synced = { ...updated, lang: selectedLanguage };
            setActiveSession(synced);
            saveCurrentSession(synced);
          }}
          onNavigateTab={(tab) => {
            const tabToPath: Record<BeneficiaryTab, string> = {
              OVERVIEW: '/beneficiary',
              JOURNEY: '/beneficiary/journey',
              PROFILE: '/beneficiary/profile',
              PASSPORT: '/beneficiary/skill-passport',
              SKILL_GAP: '/beneficiary/skill-gap',
              RECOMMENDATIONS: '/beneficiary/recommendations',
              TRAINING: '/beneficiary/training',
              PLACEMENT: '/beneficiary/placement',
              FOLLOW_UP: '/beneficiary/follow-up',
              FINANCE: '/beneficiary/finance',
              CARD: '/beneficiary/aspiration-card'
            };
            navigateTo(tabToPath[tab] || '/beneficiary');
          }}
        />
      );
    }

    // 7. Channels & Diagnostics
    if (currentPath === '/channel/whatsapp') {
      return <WhatsAppSim />;
    }

    if (currentPath === '/channel/ivr') {
      return <IvrSim />;
    }

    if (currentPath === '/diagnostics') {
      return <DiagnosticsView lang={selectedLanguage} />;
    }

    if (currentPath === '/talk') {
      return (
        <VoicePwa
          onNavigate={navigateTo}
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
        />
      );
    }

    // 8. Default: Landing Page
    return (
      <LandingPage
        onStartVoice={() => navigateTo('/talk')}
        onNavigateLogin={() => navigateTo('/login')}
        onNavigateDashboard={() => navigateTo('/coordinator')}
        lang={selectedLanguage}
      />
    );
  };

  return (
    <div className="app-root-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader
        currentPath={currentPath}
        currentUser={auth.currentUser}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onNavigate={navigateTo}
        onStartVoice={() => navigateTo('/talk')}
        onLogout={handleLogout}
      />
      <div className="app-page-content" style={{ flex: 1 }}>
        {renderPageContent()}
      </div>
      <AppFooter
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onNavigate={navigateTo}
      />
    </div>
  );
};
