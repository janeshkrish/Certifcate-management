export function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

export function truncateHash(hash) {
  if (!hash) {
    return "";
  }
  return `${hash.slice(0, 14)}...${hash.slice(-10)}`;
}

export function toTitleCase(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function openExternalUrl(url) {
  if (!url || typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
