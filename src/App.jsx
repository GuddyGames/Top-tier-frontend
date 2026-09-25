import { useState } from 'react';
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

  if (!authReady) return <SplashScreen />;

  const isAdmin = user?.role === 'admin';
  const tabs = user
    ? [...AUTH_TABS, ...PUBLIC_TABS, ...(isAdmin ? [{ key: 'admin', label: 'Control room', icon: '⚙' }] : [])]
    : PUBLIC_TABS;

  const needsAuth = ['home', 'terminal', 'dashboard', 'profile'].includes(tab);
  if (!user && needsAuth) return <Auth onDone={() => setTab('home')} />;

  const PageComponent = PAGE_COMPONENTS[tab];
  const navigate = (next) => setTab(next);

  return (
    <div className="min-h-screen bg-base font-body text-ink-primary">
      <nav className="sticky top-0 z-40 hidden border-b border-border/70 bg-base/90 px-6 py-3 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button onClick={() => navigate(user ? 'home' : 'leaderboard')} className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-base font-black shadow-sm">T</span>
            <span className="font-display text-lg font-bold tracking-tight">Top-Tier</span>
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => navigate(t.key)} className="relative rounded-xl px-3 py-2 text-sm font-medium transition-colors">
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

      <main className="mx-auto min-h-[calc(100vh-1px)] max-w-6xl pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'home' ? (
              <Home goToTerminal={() => navigate('terminal')} goToLearn={() => navigate('learn')} />
            ) : tab === 'admin' && !isAdmin ? null : (
              PageComponent && <PageComponent />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-base/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {(user ? AUTH_TABS : PUBLIC_TABS).map((t) => (
            <button key={t.key} onClick={() => navigate(t.key)} className="relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold">
              {tab === t.key && <motion.span layoutId="mobile-nav-pill" className="absolute inset-0 rounded-2xl bg-gold/15" />}
              <span className={`relative text-xl leading-none ${tab === t.key ? 'text-gold' : 'text-ink-muted'}`}>{t.icon}</span>
              <span className={`relative ${tab === t.key ? 'text-gold' : 'text-ink-muted'}`}>{t.label}</span>
            </button>
          ))}
          {!user && (
            <button onClick={() => navigate('home')} className="flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold text-gold">
              <span className="text-xl leading-none">↪</span><span>Log in</span>
            </button>
          )}
          {user && isAdmin && (
            <button onClick={() => navigate('admin')} className="flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-semibold">
              <span className={`text-xl leading-none ${tab === 'admin' ? 'text-gold' : 'text-ink-muted'}`}>⚙</span>
              <span className={tab === 'admin' ? 'text-gold' : 'text-ink-muted'}>Admin</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
