import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Globe, Layers3, LayoutDashboard, LogIn, Search } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchProfile, getApiErrorMessage } from "../api/client";
import CertificateCard from "../components/CertificateCard";
import CertificateModal from "../components/CertificateModal";
import DomainCard from "../components/DomainCard";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import StatsCard from "../components/StatsCard";
import { useAuth } from "../context/AuthContext";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDomainSlug, setSelectedDomainSlug] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfile();
        if (active) {
          setProfile(response);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, "Failed to load the public profile."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-shell flex items-center justify-center">
        <LoadingState message="Loading public profile..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="neo-panel max-w-xl p-10 text-center">
          <p className="text-xl font-extrabold text-rose-700">{error}</p>
        </div>
      </main>
    );
  }

  const selectedDomain = profile?.domains.find((domain) => domain.slug === selectedDomainSlug) || null;
  const certificates = (profile?.certificates || []).filter((certificate) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesDomain = selectedDomain ? certificate.domain.slug === selectedDomain.slug : false;
    const matchesSearch =
      !searchTerm ||
      certificate.title.toLowerCase().includes(searchTerm) ||
      certificate.issuer.toLowerCase().includes(searchTerm) ||
      certificate.certificate_number.toLowerCase().includes(searchTerm);

    return matchesDomain && matchesSearch;
  });

  return (
    <Layout
      actions={
        <Link
          className="neo-button neo-button-primary"
          to={isAuthenticated ? "/dashboard" : "/login"}
        >
          {isAuthenticated ? <LayoutDashboard size={16} /> : <LogIn size={16} />}
          {isAuthenticated ? "Dashboard" : "Admin Login"}
        </Link>
      }
      eyebrow="Public portfolio"
      subtitle={
        <div className="max-w-2xl space-y-2">
          <p className="text-base font-semibold text-accent sm:text-lg">{profile.headline}</p>
          <p className="text-sm leading-7 text-muted sm:text-base">{profile.bio}</p>
        </div>
      }
      title={profile.owner_name}
    >
      <div className="space-y-6" id="certificates">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatsCard icon={Globe} label="Published" value={profile.stats.public_certificates} />
          <StatsCard icon={Layers3} label="Domains" value={profile.stats.domains} />
          <StatsCard icon={LayoutDashboard} label="Verified" value={profile.stats.total_certificates} />
        </section>

        <section className="space-y-4">
          <div>
            <span className="neo-chip neo-chip-muted">Step 1</span>
            <h2 className="section-title mt-3 text-2xl">Browse by domain</h2>
            <p className="mt-2 text-sm text-muted">Open a domain to reveal its certificates.</p>
          </div>

          <motion.div
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            variants={gridVariants}
          >
            {profile.domains.map((domain) => (
              <motion.div key={domain.id} variants={cardVariants}>
                <DomainCard
                  active={selectedDomainSlug === domain.slug}
                  domain={domain}
                  onClick={() => startTransition(() => setSelectedDomainSlug(domain.slug))}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {selectedDomain ? (
            <motion.section
              key={selectedDomain.id}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 18 }}
            >
              <div className="neo-panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <button
                      className="text-sm font-semibold text-accent"
                      onClick={() => startTransition(() => setSelectedDomainSlug(null))}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to domains
                      </span>
                    </button>
                    <h2 className="section-title mt-3 text-2xl sm:text-3xl">{selectedDomain.name}</h2>
                    <p className="mt-2 text-sm text-muted">
                      {certificates.length} certificate{certificates.length === 1 ? "" : "s"} available
                    </p>
                  </div>

                  <div className="neo-inset flex items-center gap-3 px-4 py-3 sm:min-w-[280px]">
                    <Search size={18} className="text-accent" />
                    <input
                      className="w-full bg-transparent outline-none"
                      placeholder="Search title, issuer, or ID"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              {certificates.length ? (
                <motion.div
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  initial="hidden"
                  variants={gridVariants}
                >
                  {certificates.map((certificate) => (
                    <motion.div key={certificate.id} variants={cardVariants}>
                      <CertificateCard certificate={certificate} onClick={setSelectedCertificate} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="neo-panel p-8 text-center sm:p-10">
                  <h3 className="section-title text-xl sm:text-2xl">No certificates here yet</h3>
                  <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                    Try another domain or adjust the search query.
                  </p>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="profile-empty"
              animate={{ opacity: 1, y: 0 }}
              className="neo-panel p-8 text-center sm:p-10"
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 18 }}
            >
              <h3 className="section-title text-xl sm:text-2xl">Step 2 opens after domain selection</h3>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                Pick a domain above to see the matching certificates, then tap any card for details.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <CertificateModal
        certificate={selectedCertificate}
        isOpen={Boolean(selectedCertificate)}
        onClose={() => setSelectedCertificate(null)}
      />
    </Layout>
  );
}
