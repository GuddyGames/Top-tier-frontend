import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './auth/AuthContext';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Terminal from './pages/Terminal.jsx';
import Learn from './pages/Learn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Referrals from './pages/Referrals.jsx';
import Wallet from './pages/Wallet.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Tasks from './pages/Tasks.jsx';
import InstallApp from './components/InstallApp.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import BrandLogo from './components/BrandLogo.jsx';

const PUBLIC_TABS = [
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { key: 'learn', label: 'Learn', icon: '📚' },
  { key: 'tasks', label: 'Tasks', icon: '✓' },
];

const AUTH_TABS = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'tasks', label: 'Tasks', icon: '✓' },
  { key: 'leaderboard', label: 'Leaderboard', icon: '♜' },
  { key: 'wallet', label: 'Wallet', icon: '▣' },
  { key: 'profile', label: 'Profile', icon: '○' },
];

const PAGE_COMPONENTS = {
  leaderboard: Leaderboard,
  terminal: Terminal,
  learn: Learn,
  dashboard: Dashboard,
  profile: Profile,
  admin: Admin,
  tasks: Tasks,
  referrals: Referrals,
  wallet: Wallet,
};

export default function App() {
  const { user, authReady } = useAuth();
  const referralCode = new URLSearchParams(window.location.search).get('ref') || '';
  const [tab, setTab] = useState(user ? 'home' : referralCode ? 'home' : 'leaderboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const historyRef = useRef([user ? 'home' : referralCode ? 'home' : 'leaderboard']);
  const touchStartRef = useRef(null);

  if (!authReady) return <SplashScreen />;

  const isAdmin = user?.role === 'admin';
  // Authenticated navigation already contains the primary Tasks and Leaderboard entries.
  // Keep Learn/Terminal available from the menu without duplicating bottom/desktop tabs.
  const tabs = user ? AUTH_TABS : PUBLIC_TABS;

  const navigate = (next, replace = false) => {
    if (next === 'admin' && !isAdmin) return;
    setTab((current) => {
      if (current === next) return current;
      historyRef.current = replace ? [next] : [...historyRef.current, next].slice(-20);
      return next;
    });
    setDrawerOpen(false);
  };

  const goBack = () => {
    if (historyRef.current.length <= 1) {
      navigate(user ? 'home' : 'leaderboard', true);
      return;
    }
    const history = [...historyRef.current];
    history.pop();
    historyRef.current = history;
    setTab(history[history.length - 1]);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = Math.abs(touch.clientY - start.y);

    if (start.x <= 32 && dx >= 70 && dy <= 90) {
      setDrawerOpen(true);
    }
  };

  const needsAuth = ['home', 'terminal', 'dashboard', 'profile', 'admin', 'tasks', 'referrals', 'wallet'].includes(tab);
  if (!user && needsAuth) return <Auth initialMode={referralCode ? 'signup' : 'login'} referralCode={referralCode} onDone={() => navigate('home')} />;

  const PageComponent = PAGE_COMPONENTS[tab];

  if (typeof window !== 'undefined' && !window.__topTierNavigationBound) {
    window.__topTierNavigationBound = true;
    window.addEventListener('top-tier:navigate', (event) => {
      if (event.detail) navigate(event.detail);
    });
  }

  return (
    <div
      className="min-h-screen bg-[#030914] font-body text-ink-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <nav className="sticky top-0 z-40 hidden border-b border-brand-blue/25 bg-[#030914]/95 px-6 py-3 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')}
              aria-label={isAdmin ? 'Open control room' : 'Go to home'}
              className="rounded-xl transition-transform hover:scale-[1.02]"
            >
              <BrandLogo />
            </button>
            {tab !== (isAdmin ? 'admin' : user ? 'home' : 'leaderboard') && (
              <button
                onClick={goBack}
                aria-label="Go back"
                className="grid h-9 w-9 place-items-center rounded-xl border border-[#12365A] bg-[#071426] text-xl leading-none text-ink-muted hover:text-ink-primary"
              >
                ←
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => navigate(t.key)} className="relative rounded-xl px-3 py-2 text-sm font-medium">
                {tab === t.key && <motion.span layoutId="desktop-nav-pill" className="absolute inset-0 rounded-xl bg-brand-blue" />}
                <span className={`relative ${tab === t.key ? 'text-base' : 'text-ink-muted hover:text-ink-primary'}`}>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <InstallApp />
            {!user && <button onClick={() => navigate('home')} className="rounded-xl border border-[#12365A] px-3 py-2 text-sm text-ink-muted">Log in</button>}
          </div>
        </div>
      </nav>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-brand-blue/25 bg-[#030914]/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <button
          onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')}
          aria-label={isAdmin ? 'Open control room' : 'Go to home'}
          className="rounded-xl transition-transform active:scale-95"
        >
          <BrandLogo markClassName="h-9 w-9" textClassName="text-base" />
        </button>
        <div className="flex items-center gap-2">
          <InstallApp />
          <button type="button" onClick={goBack} aria-label="Go back" className="grid h-10 w-10 place-items-center rounded-xl border border-[#12365A] bg-[#071426] text-2xl leading-none active:scale-95">‹</button>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 z-[60] bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-[70] flex h-full w-[min(86vw,340px)] flex-col border-r border-[#12365A] bg-[#030914] p-5 shadow-2xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <button onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')}>
                  <BrandLogo markClassName="h-9 w-9" textClassName="text-base" />
                </button>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-[#12365A] text-xl">×</button>
              </div>

              <div className="mt-6 space-y-1">
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => navigate(t.key)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-[#071426]">
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
                {user && (
                  <button onClick={() => navigate('learn')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-[#071426]">
                    <span className="text-lg">📚</span>
                    <span>Learn</span>
                  </button>
                )}
                {user && (
                  <button onClick={() => navigate('terminal')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-[#071426]">
                    <span className="text-lg">⌁</span>
                    <span>Terminal</span>
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => navigate('admin')} className="flex w-full items-center gap-3 rounded-xl bg-brand-blue/10 px-4 py-3 text-left text-sm font-semibold text-brand-cyan">
                    <span className="text-lg">⚙</span>
                    <span>Control room</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto min-h-[calc(100vh-1px)] max-w-6xl pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
            {tab === 'auth' ? (
              <Auth initialMode="signup" referralCode={referralCode} onDone={() => navigate('home', true)} />
            ) : tab === 'home' ? (
              <Home goToTerminal={() => navigate('terminal')} goToLearn={() => navigate('learn')} />
            ) : tab === 'admin' && !isAdmin ? null : (
              PageComponent && <PageComponent />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-blue/25 bg-[#030914]/95 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-around gap-0.5 overflow-x-auto">
          {(user ? AUTH_TABS : PUBLIC_TABS).map((t) => (
            <button key={t.key} onClick={() => navigate(t.key)} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold active:scale-95">
              {tab === t.key && <motion.span layoutId="mobile-nav-pill" className="absolute inset-0 rounded-2xl bg-brand-blue/15" />}
              <span className={`relative text-lg leading-none ${tab === t.key ? 'text-brand-cyan' : 'text-ink-muted'}`}>{t.icon}</span>
              <span className={`relative whitespace-nowrap ${tab === t.key ? 'text-brand-cyan' : 'text-ink-muted'}`}>{t.label}</span>
            </button>
          ))}
          <button onClick={() => setDrawerOpen(true)} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold text-ink-muted active:scale-95">
            <span className="text-lg leading-none">☰</span>
            <span className="whitespace-nowrap">Menu</span>
          </button>
          {!user && (
            <button onClick={() => navigate('home')} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold text-brand-cyan active:scale-95">
              <span className="text-lg leading-none">↪</span><span className="whitespace-nowrap">Log in</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
