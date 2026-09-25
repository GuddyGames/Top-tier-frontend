import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo.jsx';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-brand-navy text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.18),transparent_34%)]" />
      <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.72, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          initial={{ rotate: -18 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.25, duration: 0.65, type: 'spring', stiffness: 180 }}
          className="relative grid h-28 w-28 place-items-center rounded-[30px] border border-white/10 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute h-20 w-20 rounded-3xl bg-brand-cyan/20 blur-md"
          />
          <img src="/icons/top-tier-mark.svg" alt="Top-Tier" className="relative h-full w-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6"
        >
          <BrandLogo markClassName="hidden" textClassName="text-4xl sm:text-5xl" showTagline />
        </motion.div>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 170, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.55 }}
          className="mt-5 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45"
        >
          Powered by HPH Programming
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.12 }}
          className="mt-1 text-xs font-semibold text-brand-orange"
        >
          G^_^E AI
        </motion.p>
      </motion.div>
    </div>
  );
}
