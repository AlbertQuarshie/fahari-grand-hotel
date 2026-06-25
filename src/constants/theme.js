/* Fahari Grand design tokens — matches Landing.jsx
   Navy: #0B1F3A / #13294B  |  Ivory: #FAF8F3  |  Gold: #C9A24B
   Display: Playfair Display  |  Body: Source Sans Pro
*/

export const display = "font-['Playfair_Display',_serif]";
export const body = "font-['Source_Sans_Pro',_sans-serif]";

export const pageTitle = `${display} text-2xl sm:text-3xl font-bold text-[#0B1F3A]`;
export const pageSubtitle = "text-[#0B1F3A] text-sm mt-1 font-semibold";
export const sectionLabel = "text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase";

export const card = "bg-white rounded border border-[#0B1F3A]/10";
export const cardHover = "bg-white rounded border border-[#0B1F3A]/10 hover:border-[#C9A24B] transition-all";
export const cardDark = "bg-[#13294B] rounded border border-[#C9A24B]/20";

export const btnPrimary =
  "bg-[#C9A24B] text-[#0B1F3A] font-bold hover:bg-white transition disabled:opacity-50";
export const btnNavy =
  "bg-[#0B1F3A] text-white font-bold hover:bg-[#C9A24B] hover:text-[#0B1F3A] transition disabled:opacity-50";
export const btnOutline =
  "border-2 border-[#0B1F3A] text-[#0B1F3A] font-bold hover:border-[#C9A24B] hover:text-[#C9A24B] transition";
export const btnGhost =
  "text-[#0B1F3A] font-semibold hover:text-[#C9A24B] transition";
export const btnDanger =
  "bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50";

export const input =
  "w-full px-4 py-2 rounded bg-white text-[#0B1F3A] border border-[#0B1F3A]/20 focus:border-[#C9A24B] focus:outline-none text-sm font-semibold";
export const inputDark =
  "w-full px-4 py-2 rounded bg-[#0B1F3A] text-white border border-[#C9A24B]/30 focus:border-[#C9A24B] focus:outline-none text-sm";
export const select =
  "px-3 py-2 rounded bg-white text-[#0B1F3A] border border-[#0B1F3A]/20 focus:border-[#C9A24B] focus:outline-none text-sm font-semibold";
export const selectDark =
  "px-3 py-2 rounded bg-[#0B1F3A] text-white border border-[#C9A24B]/30 focus:border-[#C9A24B] focus:outline-none text-sm";

export const filterBar = `${card} p-4 flex flex-wrap gap-3 items-center`;
export const emptyState = "text-center py-16 text-[#0B1F3A] font-semibold";
export const skeleton = "animate-pulse bg-[#0B1F3A]/10 rounded border border-[#0B1F3A]/10";

export const statusBadge = {
  available: "bg-emerald-100 text-emerald-900 border border-emerald-400",
  occupied: "bg-red-100 text-red-900 border border-red-400",
  cleaning: "bg-amber-100 text-amber-900 border border-amber-400",
  maintenance: "bg-slate-200 text-slate-900 border border-slate-400",
  pending: "bg-amber-100 text-amber-900 border border-amber-400",
  confirmed: "bg-emerald-100 text-emerald-900 border border-emerald-400",
  cancelled: "bg-red-100 text-red-900 border border-red-400",
  checked_in: "bg-blue-100 text-blue-900 border border-blue-400",
  checked_out: "bg-slate-200 text-slate-900 border border-slate-400",
  open: "bg-red-100 text-red-900 border border-red-400",
  in_progress: "bg-blue-100 text-blue-900 border border-blue-400",
  resolved: "bg-emerald-100 text-emerald-900 border border-emerald-400",
  dirty: "bg-red-100 text-red-900 border border-red-400",
  clean: "bg-emerald-100 text-emerald-900 border border-emerald-400",
  inspected: "bg-blue-100 text-blue-900 border border-blue-400",
  low: "bg-slate-200 text-slate-900 border border-slate-400",
  medium: "bg-amber-100 text-amber-900 border border-amber-400",
  high: "bg-red-100 text-red-900 border border-red-400",
  admin: "bg-amber-100 text-amber-900 border border-amber-400",
  receptionist: "bg-blue-100 text-blue-900 border border-blue-400",
  housekeeper: "bg-emerald-100 text-emerald-900 border border-emerald-400",
  guest: "bg-slate-200 text-slate-900 border border-slate-400",
};

export const badge = (status) =>
  `text-xs font-bold px-2.5 py-0.5 rounded capitalize ${statusBadge[status] || statusBadge.maintenance}`;
