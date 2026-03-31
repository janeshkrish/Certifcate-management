import { motion } from "framer-motion";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginCard({
  email,
  error,
  loading = false,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="neo-panel w-full max-w-md p-6 sm:p-8"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
    >
      <div className="space-y-4">
        <div className="neo-inset flex h-14 w-14 items-center justify-center rounded-[18px]">
          <LockKeyhole size={22} className="text-accent" />
        </div>
        <div>
          <span className="neo-chip neo-chip-muted">Secure access</span>
          <h1 className="section-title mt-4 text-3xl">Admin Login</h1>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-muted">Email</span>
          <input
            autoComplete="email"
            className="neo-input"
            placeholder="admin@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-muted">Password</span>
          <input
            autoComplete="current-password"
            className="neo-input"
            placeholder="Enter password"
            required
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>

        {error ? (
          <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <motion.button
          className="neo-button neo-button-primary w-full"
          disabled={loading}
          transition={{ duration: 0.18 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign In"}
        </motion.button>
      </form>

      <div className="mt-5 text-sm text-muted">
        <Link className="inline-flex items-center gap-2 font-semibold text-accent" to="/profile">
          View public profile
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </motion.section>
  );
}
