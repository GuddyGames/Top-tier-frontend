import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#08090c] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(234,179,8,0.16),transparent_34%)]" />
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
          className="relative grid h-24 w-24 place-items-center rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute h-14 w-14 rounded-2xl bg-gold/20 blur-md"
          />
          <span className="relative font-display text-3xl font-black tracking-tight">T</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-5 text-2xl font-bold tracking-tight"
        >
          Top-Tier
        </motion.h1>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 150, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.55 }}
          className="mt-3 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45"
        >
          Powered by HPH Programming
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.12 }}
          className="mt-1 text-xs font-semibold text-gold"
        >
          G^_^E AI
        </motion.p>
      </motion.div>
    </div>
  );
}
