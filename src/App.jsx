import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Terminal from './pages/Terminal.jsx';
import Learn from './pages/Learn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';

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

  return (
    <div className="min-h-screen bg-base font-body text-ink-primary">
      <nav className="border-b border-border bg-surface px-6 py-3 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.key
                    ? 'bg-gold text-base'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {!user && (
            <button
              onClick={() => setTab('home')}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:text-ink-primary"
            >
              Log in
            </button>
          )}
        </div>
      </nav>

      {tab === 'home' && user && <Home goToTerminal={() => setTab('terminal')} goToLearn={() => setTab('learn')} />}
      {tab === 'leaderboard' && <Leaderboard />}
      {tab === 'terminal' && user && <Terminal />}
      {tab === 'learn' && <Learn />}
      {tab === 'dashboard' && user && <Dashboard />}
      {tab === 'profile' && user && <Profile />}
      {tab === 'admin' && isAdmin && <Admin />}
    </div>
  );
}
