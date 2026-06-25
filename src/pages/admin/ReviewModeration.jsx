import { useEffect, useState } from "react";
import { getReviews, approveReview, deleteReview } from "../../api/admin.api";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  display, pageTitle, pageSubtitle, card,
  btnPrimary, btnOutline, emptyState, skeleton,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 8;

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getReviews();
        if (!cancelled) setReviews(data);
      } catch {
        if (!cancelled) toast.error("Failed to load reviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getReviews();
      setReviews(data);
    } catch {
      toast.error("Failed to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await approveReview(id);
      const updated = await getReviews();
      setReviews(updated);
      toast.success("Review approved.");
    } catch (err) {
      console.error("Approve error:", err.response?.data);
      toast.error(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Failed to approve review."
      );
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id) => {
    setActioning(id);
    try {
      await deleteReview(id);
      const updated = await getReviews();
      setReviews(updated);
      toast.success("Review deleted.");
    } catch {
      toast.error("Failed to delete review.");
    } finally {
      setActioning(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  const pending = reviews.filter((r) => !r.is_approved).length;
  const approved = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Review Moderation</h2>
          <p className={pageSubtitle}>
            Approve or remove guest reviews before they go public.
          </p>
        </div>
        <button
          onClick={refresh}
          className={`px-4 py-2 rounded text-sm ${btnOutline} self-start`}
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: reviews.length, color: "text-[#0B1F3A]" },
          { label: "Pending", value: pending, color: "text-[#C9A24B]" },
          { label: "Approved", value: approved, color: "text-emerald-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4 text-center`}>
            <p className={`${display} font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-[#0B1F3A]/60 text-xs mt-1 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-white rounded border border-[#0B1F3A]/10 p-1 w-fit">
        {["all", "pending", "approved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm font-bold capitalize transition ${
              filter === f
                ? btnPrimary
                : "text-[#0B1F3A]/60 hover:text-[#0B1F3A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-36 ${skeleton}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={emptyState}>
          <p>No reviews found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedItems.map((review) => (
              <div
                key={review.id}
                className={`${card} p-5 space-y-3 ${
                  review.is_approved
                    ? "border-emerald-200"
                    : "border-[#C9A24B]/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center text-[#C9A24B] font-bold text-xs">
                          {review.guest_username?.[0]?.toUpperCase() || "G"}
                        </div>
                        <span className="text-[#0B1F3A] font-bold text-sm">
                          {review.guest_username || `Guest #${review.guest}`}
                        </span>
                      </div>
                      <span className="text-[#0B1F3A]/50 text-xs font-semibold">
                        Room {review.room_number || review.room}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                        review.is_approved
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                          : "bg-amber-100 text-amber-900 border border-amber-400"
                      }`}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <div className="flex gap-0.5 items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-[#C9A24B] fill-[#C9A24B]" : "text-[#0B1F3A]/20"}
                        />
                      ))}
                      <span className="text-[#0B1F3A]/60 text-xs ml-1 font-semibold">{review.rating}/5</span>
                    </div>
                  </div>

                  <p className="text-[#0B1F3A]/50 text-xs font-semibold">
                    {new Date(review.created_at).toLocaleDateString("en-KE", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>

                {review.comment && (
                  <p className="text-[#0B1F3A]/80 text-sm leading-relaxed italic border-l-2 border-[#C9A24B] pl-3 font-semibold">
                    "{review.comment}"
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actioning === review.id}
                      className={`px-3 py-1.5 rounded text-sm font-bold border-2 border-emerald-300 text-emerald-800 hover:border-emerald-500 transition disabled:opacity-50`}
                    >
                      {actioning === review.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={actioning === review.id}
                    className="px-3 py-1.5 rounded text-sm font-bold text-red-700 border-2 border-red-200 hover:border-red-400 transition disabled:opacity-50"
                  >
                    {actioning === review.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  );
};

export default ReviewModeration;
