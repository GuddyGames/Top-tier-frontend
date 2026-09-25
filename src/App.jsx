import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './auth/AuthContext';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Terminal from './pages/Terminal.jsx';
import Learn from './pages/Learn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import InstallApp from './components/InstallApp.jsx';
import SplashScreen from './components/SplashScreen.jsx';

const PUBLIC_TABS = [
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { key: 'learn', label: 'Learn', icon: '📚' },
];

const AUTH_TABS = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'terminal', label: 'Terminal', icon: '⌁' },
  { key: 'dashboard', label: 'Dashboard', icon: '▣' },
  { key: 'profile', label: 'Profile', icon: '○' },
];

const PAGE_COMPONENTS = {
  leaderboard: Leaderboard,
  terminal: Terminal,
  learn: Learn,
  dashboard: Dashboard,
  profile: Profile,
  admin: Admin,
};

export default function App() {
  const { user, authReady } = useAuth();
  const [tab, setTab] = useState(user ? 'home' : 'leaderboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const historyRef = useRef([user ? 'home' : 'leaderboard']);
  const touchStartRef = useRef(null);

  if (!authReady) return <SplashScreen />;

  const isAdmin = user?.role === 'admin';
  const tabs = user ? [...AUTH_TABS, ...PUBLIC_TABS] : PUBLIC_TABS;

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

    // Edge swipe from the left opens the mobile navigation drawer.
    if (start.x <= 32 && dx >= 70 && dy <= 90) {
      setDrawerOpen(true);
    }
  };

  const needsAuth = ['home', 'terminal', 'dashboard', 'profile', 'admin'].includes(tab);
  if (!user && needsAuth) return <Auth onDone={() => navigate('home')} />;

  const PageComponent = PAGE_COMPONENTS[tab];

  return (
    <div
      className="min-h-screen bg-base font-body text-ink-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <nav className="sticky top-0 z-40 hidden border-b border-border/70 bg-base/90 px-6 py-3 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')}
              aria-label={isAdmin ? 'Open control room' : 'Go to home'}
              className="flex items-center gap-2"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-base font-black">T</span>
              <span className="font-display text-lg font-bold tracking-tight">Top-Tier</span>
            </button>
            {tab !== (isAdmin ? 'admin' : user ? 'home' : 'leaderboard') && (
              <button
                onClick={goBack}
                aria-label="Go back"
                className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-xl leading-none text-ink-muted hover:text-ink-primary"
              >
                ←
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => navigate(t.key)} className="relative rounded-xl px-3 py-2 text-sm font-medium">
                {tab === t.key && <motion.span layoutId="desktop-nav-pill" className="absolute inset-0 rounded-xl bg-gold" />}
                <span className={`relative ${tab === t.key ? 'text-base' : 'text-ink-muted hover:text-ink-primary'}`}>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <InstallApp />
            {!user && <button onClick={() => navigate('home')} className="rounded-xl border border-border px-3 py-2 text-sm text-ink-muted">Log in</button>}
          </div>
        </div>
      </nav>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-base/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <button
          onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')}
          aria-label={isAdmin ? 'Open control room' : 'Go to home'}
          className="flex items-center gap-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-base font-black">T</span>
          <span className="font-display text-base font-bold">Top-Tier</span>
        </button>
        <div className="flex items-center gap-2">
          <InstallApp />
          <button type="button" onClick={goBack} aria-label="Go back" className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-2xl leading-none active:scale-95">‹</button>
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
              className="fixed left-0 top-0 z-[70] flex h-full w-[min(86vw,340px)] flex-col border-r border-border bg-base p-5 shadow-2xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <button onClick={() => navigate(isAdmin ? 'admin' : user ? 'home' : 'leaderboard')} className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-base font-black">T</span>
                  <span className="font-display text-base font-bold">Top-Tier</span>
                </button>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-xl">×</button>
              </div>

              <div className="mt-6 space-y-1">
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => navigate(t.key)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-surface">
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
                {isAdmin && (
                  <button onClick={() => navigate('admin')} className="flex w-full items-center gap-3 rounded-xl bg-gold/10 px-4 py-3 text-left text-sm font-semibold text-gold">
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
            {tab === 'home' ? (
              <Home goToTerminal={() => navigate('terminal')} goToLearn={() => navigate('learn')} />
            ) : tab === 'admin' && !isAdmin ? null : (
              PageComponent && <PageComponent />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-base/95 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-around gap-0.5 overflow-x-auto">
          {(user ? [...AUTH_TABS, ...PUBLIC_TABS] : PUBLIC_TABS).map((t) => (
            <button key={t.key} onClick={() => navigate(t.key)} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold active:scale-95">
              {tab === t.key && <motion.span layoutId="mobile-nav-pill" className="absolute inset-0 rounded-2xl bg-gold/15" />}
              <span className={`relative text-lg leading-none ${tab === t.key ? 'text-gold' : 'text-ink-muted'}`}>{t.icon}</span>
              <span className={`relative whitespace-nowrap ${tab === t.key ? 'text-gold' : 'text-ink-muted'}`}>{t.label}</span>
            </button>
          ))}
          <button onClick={() => setDrawerOpen(true)} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold text-ink-muted active:scale-95">
            <span className="text-lg leading-none">☰</span>
            <span className="whitespace-nowrap">Menu</span>
          </button>
          {!user && (
            <button onClick={() => navigate('home')} className="relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold text-gold active:scale-95">
              <span className="text-lg leading-none">↪</span><span className="whitespace-nowrap">Log in</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
