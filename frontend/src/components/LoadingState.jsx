import { motion } from "framer-motion";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="neo-panel mx-auto max-w-sm p-8 text-center">
      <div className="mx-auto flex w-fit items-center gap-2">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -5, 0] }}
            className="block h-3 w-3 rounded-full bg-accent"
            transition={{ duration: 0.9, delay: index * 0.12, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted">{message}</p>
    </div>
  );
}
