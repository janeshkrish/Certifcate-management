import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      className="neo-panel-soft p-4 sm:p-5"
      transition={{ duration: 0.18 }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="section-title mt-3 text-2xl sm:text-3xl">{value}</p>
        </div>
        {Icon ? (
          <div className="neo-inset flex h-11 w-11 items-center justify-center rounded-[16px]">
            <Icon size={18} className="text-accent" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
