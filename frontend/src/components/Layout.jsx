import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeInOut" } }
};

export default function Layout({
  actions,
  children,
  centered = false,
  eyebrow,
  subtitle,
  title
}) {
  return (
    <motion.main
      animate="animate"
      className="page-shell"
      exit="exit"
      initial="initial"
      variants={pageVariants}
    >
      <div className={`mx-auto flex w-full max-w-7xl flex-col gap-4 ${centered ? "min-h-[calc(100vh-2rem)]" : ""}`}>
        <div className="neo-panel-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <Link className="flex items-center gap-3" to="/profile">
            <div className="neo-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate system</p>
              <p className="section-title text-lg">ACMS</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
        </div>

        {title ? (
          <header className="neo-panel overflow-hidden p-5 sm:p-6 lg:p-8">
            {eyebrow ? <span className="neo-chip neo-chip-accent">{eyebrow}</span> : null}
            <h1 className="section-title mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
            {subtitle ? <div className="mt-4">{subtitle}</div> : null}
          </header>
        ) : null}

        {centered ? (
          <div className="flex flex-1 items-center justify-center py-8">{children}</div>
        ) : (
          children
        )}
      </div>
    </motion.main>
  );
}
