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

const PUBLIC_TABS = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'learn', label: 'Learn' },
];

const AUTH_TABS = [
  { key: 'home', label: 'Home' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
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
  const { user } = useAuth();
  const [tab, setTab] = useState(user ? 'home' : 'leaderboard');

  const isAdmin = user?.role === 'admin';
  const tabs = user
    ? [...AUTH_TABS, ...PUBLIC_TABS, ...(isAdmin ? [{ key: 'admin', label: 'Control room' }] : [])]
    : PUBLIC_TABS;

  const needsAuth = ['home', 'terminal', 'dashboard', 'profile'].includes(tab);
  if (!user && needsAuth) {
    return <Auth onDone={() => setTab('home')} />;
  }

  const PageComponent = PAGE_COMPONENTS[tab];

  return (
    <div className="min-h-screen bg-base font-body text-ink-primary">
      <nav className="border-b border-border bg-surface px-6 py-3 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-gold"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative ${tab === t.key ? 'text-base' : 'text-ink-muted hover:text-ink-primary'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <InstallApp />
            {!user && (
              <button
                onClick={() => setTab('home')}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:text-ink-primary"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.99 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === 'home' ? (
            <Home goToTerminal={() => setTab('terminal')} goToLearn={() => setTab('learn')} />
          ) : tab === 'admin' && !isAdmin ? null : (
            PageComponent && <PageComponent />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
