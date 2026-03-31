import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Pencil,
  QrCode,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

import { formatDate, toTitleCase } from "../utils/format";

export default function CertificateModal({
  isOpen,
  mode = "detail",
  domains = [],
  certificate,
  initialDomainId = "",
  isAdmin = false,
  submitting = false,
  onClose,
  onDeleteRequest,
  onEditRequest,
  onSubmit
}) {
  const [form, setForm] = useState({
    title: "",
    domain_id: "",
    issuer: "",
    issue_date: "",
    verification_link: "",
    description: "",
    visibility: "public",
    file: null
  });

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || mode === "detail") {
      return;
    }

    if (certificate && mode === "edit") {
      setForm({
        title: certificate.title,
        domain_id: certificate.domain.id,
        issuer: certificate.issuer,
        issue_date: certificate.issue_date,
        verification_link: certificate.verification_link,
        description: certificate.description,
        visibility: certificate.visibility,
        file: null
      });
      return;
    }

    setForm({
      title: "",
      domain_id: initialDomainId || domains[0]?.id || "",
      issuer: "",
      issue_date: "",
      verification_link: "",
      description: "",
      visibility: "public",
      file: null
    });
  }, [certificate, domains, initialDomainId, isOpen, mode]);

  const isFormMode = mode === "create" || mode === "edit";

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    await onSubmit(payload);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="neo-panel relative max-h-[92vh] w-full max-w-4xl overflow-y-auto p-5 sm:p-7"
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {certificate?.domain?.name ? (
                    <span className="neo-chip neo-chip-accent">{certificate.domain.name}</span>
                  ) : null}
                  {certificate?.visibility ? (
                    <span className="neo-chip neo-chip-muted">{toTitleCase(certificate.visibility)}</span>
                  ) : null}
                  {isFormMode ? (
                    <span className="neo-chip neo-chip-muted">
                      {mode === "create" ? "Create certificate" : "Edit certificate"}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h2 className="section-title text-2xl sm:text-3xl">
                    {isFormMode
                      ? mode === "create"
                        ? "New Certificate"
                        : "Edit Certificate"
                      : certificate?.title}
                  </h2>
                  {isFormMode ? null : (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                      {certificate?.description}
                    </p>
                  )}
                </div>
              </div>

              <button className="neo-icon-button" onClick={onClose} type="button">
                <X size={18} />
              </button>
            </div>

            {isFormMode ? (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Title</span>
                    <input
                      className="neo-input"
                      required
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Domain</span>
                    <select
                      className="neo-select"
                      required
                      value={form.domain_id}
                      onChange={(event) => updateField("domain_id", event.target.value)}
                    >
                      <option value="" disabled>
                        Select a domain
                      </option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Issuer</span>
                    <input
                      className="neo-input"
                      required
                      value={form.issuer}
                      onChange={(event) => updateField("issuer", event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Issue Date</span>
                    <input
                      className="neo-input"
                      required
                      type="date"
                      value={form.issue_date}
                      onChange={(event) => updateField("issue_date", event.target.value)}
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-muted">Verification Link</span>
                    <input
                      className="neo-input"
                      required
                      type="url"
                      value={form.verification_link}
                      onChange={(event) => updateField("verification_link", event.target.value)}
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-muted">Description</span>
                    <textarea
                      className="neo-textarea min-h-32"
                      required
                      value={form.description}
                      onChange={(event) => updateField("description", event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">Visibility</span>
                    <select
                      className="neo-select"
                      value={form.visibility}
                      onChange={(event) => updateField("visibility", event.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-muted">
                      File {mode === "create" ? "(Required)" : "(Optional)"}
                    </span>
                    <input
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      className="neo-input cursor-pointer file:mr-4 file:rounded-2xl file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white"
                      required={mode === "create"}
                      type="file"
                      onChange={(event) => updateField("file", event.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button className="neo-button" onClick={onClose} type="button">
                    Cancel
                  </button>
                  <button className="neo-button neo-button-primary" disabled={submitting} type="submit">
                    {submitting ? "Saving..." : mode === "create" ? "Create Certificate" : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : certificate ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="neo-inset p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issuer</p>
                      <p className="mt-3 text-base font-semibold text-ink">{certificate.issuer}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Issued</p>
                      <div className="mt-3 flex items-center gap-2 text-base font-semibold text-ink">
                        <CalendarDays size={16} className="text-accent" />
                        <span>{formatDate(certificate.issue_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="neo-inset p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Certificate ID</p>
                    <div className="mt-3 flex items-center gap-2 break-all text-sm font-semibold text-ink sm:text-base">
                      <ShieldCheck size={16} className="shrink-0 text-accent" />
                      <span>{certificate.certificate_number}</span>
                    </div>
                  </div>

                  <div className="neo-inset p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SHA-256 Hash</p>
                    <p className="mt-3 break-all text-sm leading-7 text-ink">{certificate.data_hash}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="neo-panel-soft p-5 text-center">
                    <div className="neo-inset mx-auto flex h-48 w-48 items-center justify-center rounded-[24px] p-4">
                      <img
                        alt={`QR code for ${certificate.title}`}
                        className="h-full w-full rounded-2xl object-cover"
                        src={certificate.qr_code_data_url}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted">
                      <QrCode size={16} />
                      QR verification
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <a
                      className="neo-button neo-button-primary flex items-center justify-center gap-2"
                      href={certificate.file_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <FileText size={16} />
                      View File
                    </a>
                    <a
                      className="neo-button flex items-center justify-center gap-2"
                      href={certificate.verification_link}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={16} />
                      Verify
                    </a>
                  </div>

                  {isAdmin ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        className="neo-button flex items-center justify-center gap-2"
                        onClick={() => onEditRequest?.(certificate)}
                        type="button"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        className="neo-button flex items-center justify-center gap-2 text-rose-600"
                        onClick={() => onDeleteRequest?.(certificate)}
                        type="button"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
