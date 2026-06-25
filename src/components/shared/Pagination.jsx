import { btnOutline, btnPrimary } from "../../constants/theme";

const Pagination = ({ page, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalItems <= itemsPerPage) return null;

  const from = (page - 1) * itemsPerPage + 1;
  const to = Math.min(page * itemsPerPage, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#0B1F3A]/10">
      <p className="text-[#0B1F3A] text-sm font-semibold">
        Showing {from}–{to} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`px-4 py-2 rounded text-sm ${btnOutline} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-[#0B1F3A] font-semibold">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[2.25rem] py-2 rounded text-sm font-bold transition ${
                  page === p
                    ? `${btnPrimary} px-3`
                    : "text-[#0B1F3A] hover:text-[#C9A24B] px-2"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`px-4 py-2 rounded text-sm ${btnOutline} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
