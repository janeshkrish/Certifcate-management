import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChartNoAxesColumn, Globe, Layers3, Lock, LogOut, Plus, Search } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createCertificate,
  createDomain,
  fetchCertificates,
  fetchDomains,
  getApiErrorMessage,
  removeCertificate,
  removeDomain,
  updateCertificate
} from "../api/client";
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [domains, setDomains] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [domainName, setDomainName] = useState("");
  const [selectedDomainSlug, setSelectedDomainSlug] = useState(null);
  const [modalState, setModalState] = useState({ open: false, mode: "detail", certificate: null });
  const [submitting, setSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [domainsResponse, certificatesResponse] = await Promise.all([
        fetchDomains(),
        fetchCertificates()
      ]);
      setDomains(domainsResponse);
      setCertificates(certificatesResponse);
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to load dashboard data."));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDomain(name) {
    try {
      setError("");
      const createdDomain = await createDomain({ name });
      await loadDashboard();
      startTransition(() => setSelectedDomainSlug(createdDomain.slug));
      return true;
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return false;
      }
      setError(getApiErrorMessage(requestError, "Failed to create domain."));
      return false;
    }
  }

  async function handleDeleteDomain(domain) {
    const shouldDelete = window.confirm(`Delete the ${domain.name} domain?`);
    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      await removeDomain(domain.id);
      if (selectedDomainSlug === domain.slug) {
        startTransition(() => setSelectedDomainSlug(null));
      }
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to delete domain."));
    }
  }

  async function handleCreateDomain(event) {
    event.preventDefault();
    const trimmed = domainName.trim();
    if (!trimmed) {
      return;
    }

    const reset = await handleAddDomain(trimmed);
    if (reset) {
      setDomainName("");
    }
  }

  function openDetailModal(certificate) {
    setModalState({ open: true, mode: "detail", certificate });
  }

  function openCreateModal() {
    setModalState({ open: true, mode: "create", certificate: null });
  }

  function openEditModal(certificate) {
    setModalState({ open: true, mode: "edit", certificate });
  }

  function closeModal() {
    setModalState({ open: false, mode: "detail", certificate: null });
  }

  async function handleSubmitCertificate(formData) {
    try {
      setSubmitting(true);
      setError("");

      if (modalState.mode === "edit" && modalState.certificate) {
        await updateCertificate(modalState.certificate.id, formData);
      } else {
        await createCertificate(formData);
      }

      closeModal();
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to save certificate."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCertificate(certificate) {
    const shouldDelete = window.confirm(`Delete certificate "${certificate.title}"?`);
    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      await removeCertificate(certificate.id);
      closeModal();
      await loadDashboard();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(getApiErrorMessage(requestError, "Failed to delete certificate."));
    }
  }

  if (loading) {
    return (
      <main className="page-shell flex items-center justify-center">
        <LoadingState message="Loading admin dashboard..." />
      </main>
    );
  }

  const selectedDomain = domains.find((domain) => domain.slug === selectedDomainSlug) || null;
  const visibleCertificates = certificates.filter((certificate) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesDomain = selectedDomain ? certificate.domain.slug === selectedDomain.slug : false;
    const matchesSearch =
      !searchTerm ||
      certificate.title.toLowerCase().includes(searchTerm) ||
      certificate.issuer.toLowerCase().includes(searchTerm) ||
      certificate.certificate_number.toLowerCase().includes(searchTerm);

    return matchesDomain && matchesSearch;
  });

  const publicCount = certificates.filter((certificate) => certificate.visibility === "public").length;
  const privateCount = certificates.length - publicCount;

  return (
    <Layout
      actions={
        <>
          <Link className="neo-button" to="/profile">
            <Globe size={16} />
            Public View
          </Link>
          <button className="neo-button" onClick={logout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </>
      }
      eyebrow="Admin workspace"
      subtitle={
        <span className="block max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Signed in as <span className="font-semibold text-ink">{admin?.full_name || "Administrator"}</span>
          {" · "}
          <span className="break-all">{admin?.email}</span>
        </span>
      }
      title="Certificate dashboard"
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[18px] bg-dangerSoft px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatsCard icon={Layers3} label="Total domains" value={domains.length} />
          <StatsCard icon={ChartNoAxesColumn} label="Certificates" value={certificates.length} />
          <StatsCard icon={Globe} label="Public" value={publicCount} />
          <StatsCard icon={Lock} label="Private" value={privateCount} />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="neo-chip neo-chip-muted">Step 1</span>
              <h2 className="section-title mt-3 text-2xl">Choose a domain</h2>
              <p className="mt-2 text-sm text-muted">Domains come first. Certificates appear only after selection.</p>
            </div>

            <form className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto]" onSubmit={handleCreateDomain}>
              <input
                className="neo-input"
                placeholder="Add a new domain"
                value={domainName}
                onChange={(event) => setDomainName(event.target.value)}
              />
              <button className="neo-button neo-button-primary" type="submit">
                <Plus size={16} />
                Add Domain
              </button>
            </form>
          </div>

          {!domains.length ? (
            <div className="neo-panel p-8 text-center sm:p-10">
              <h3 className="section-title text-xl sm:text-2xl">Create your first domain</h3>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                Start with areas like AI, Cloud, Security, or Development before adding certificates.
              </p>
            </div>
          ) : (
            <motion.div
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              initial="hidden"
              variants={gridVariants}
            >
              {domains.map((domain) => (
                <motion.div key={domain.id} variants={cardVariants}>
                  <DomainCard
                    active={selectedDomainSlug === domain.slug}
                    domain={domain}
                    isAdmin
                    onClick={() => startTransition(() => setSelectedDomainSlug(domain.slug))}
                    onDelete={handleDeleteDomain}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
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
                      {visibleCertificates.length} certificate{visibleCertificates.length === 1 ? "" : "s"} in this domain
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="neo-inset flex items-center gap-3 px-4 py-3 sm:min-w-[280px]">
                      <Search size={18} className="text-accent" />
                      <input
                        className="w-full bg-transparent outline-none"
                        placeholder="Search title, issuer, or ID"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <button className="neo-button neo-button-primary" onClick={openCreateModal} type="button">
                      <Plus size={16} />
                      Add Certificate
                    </button>
                  </div>
                </div>
              </div>

              {visibleCertificates.length ? (
                <motion.div
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  initial="hidden"
                  variants={gridVariants}
                >
                  {visibleCertificates.map((certificate) => (
                    <motion.div key={certificate.id} variants={cardVariants}>
                      <CertificateCard
                        certificate={certificate}
                        isAdmin
                        onClick={openDetailModal}
                        onDelete={handleDeleteCertificate}
                        onEdit={openEditModal}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="neo-panel p-8 text-center sm:p-10">
                  <h3 className="section-title text-xl sm:text-2xl">No certificates yet</h3>
                  <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                    Add the first certificate for {selectedDomain.name} or adjust the search query.
                  </p>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="dashboard-empty"
              animate={{ opacity: 1, y: 0 }}
              className="neo-panel p-8 text-center sm:p-10"
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 18 }}
            >
              <h3 className="section-title text-xl sm:text-2xl">Step 2 starts after domain selection</h3>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                Tap a domain above to reveal its certificate list and management actions.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <CertificateModal
        certificate={modalState.certificate}
        domains={domains}
        initialDomainId={selectedDomain?.id || ""}
        isAdmin
        isOpen={modalState.open}
        mode={modalState.mode}
        submitting={submitting}
        onClose={closeModal}
        onDeleteRequest={handleDeleteCertificate}
        onEditRequest={openEditModal}
        onSubmit={handleSubmitCertificate}
      />
    </Layout>
  );
}
