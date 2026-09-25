import { useEffect, useState } from 'react';

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isAndroid = /android/i.test(window.navigator.userAgent);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) return null;

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') setPrompt(null);
      return;
    }
    if (isIos) setShowIosHelp(true);
    else if (isAndroid) setShowAndroidHelp(true);
  };

  return (
    <>
      <button type="button" onClick={install} className="rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-bold text-gold active:scale-95">
        Install
      </button>

      {(showIosHelp || showAndroidHelp) && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => { setShowIosHelp(false); setShowAndroidHelp(false); }}>
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Install Top-Tier</h2>
              <button type="button" onClick={() => { setShowIosHelp(false); setShowAndroidHelp(false); }} className="grid h-9 w-9 place-items-center rounded-full bg-base text-xl text-ink-muted">×</button>
            </div>
            {showAndroidHelp ? (
              <p className="text-sm leading-6 text-ink-muted">
                Chrome has not offered the automatic install prompt yet. Open the browser <strong className="text-ink-primary">⋮ menu</strong> and choose <strong className="text-ink-primary">Install app</strong> or <strong className="text-ink-primary">Add to Home screen</strong>.
              </p>
            ) : (
              <p className="text-sm leading-6 text-ink-muted">
                On iPhone or iPad, tap the <strong className="text-ink-primary">Share</strong> button in Safari, then choose <strong className="text-ink-primary">Add to Home Screen</strong>.
              </p>
            )}
            <button type="button" onClick={() => { setShowIosHelp(false); setShowAndroidHelp(false); }} className="mt-4 w-full rounded-xl bg-gold px-4 py-3 font-bold text-base">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
