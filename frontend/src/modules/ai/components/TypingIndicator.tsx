import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        className="h-2 w-2 rounded-full bg-cyan"
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        className="h-2 w-2 rounded-full bg-cyan"
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        className="h-2 w-2 rounded-full bg-cyan"
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
      <span>Streaming response...</span>
    </div>
  );
}
