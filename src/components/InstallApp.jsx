import { useEffect, useState } from 'react';

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (!prompt) return null;

  const install = async () => {
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={install}
      className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold hover:bg-gold/20"
    >
      Install app
    </button>
  );
}
