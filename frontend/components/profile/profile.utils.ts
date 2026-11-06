export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "refund completed":
      return "text-emerald-400";
    case "processing":
    case "under inspection":
      return "text-amber-400";
    case "shipped":
      return "text-sky-400";
    case "cancelled":
      return "text-red-400";
    default:
      return "text-white/70";
  }
};

export const getInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
