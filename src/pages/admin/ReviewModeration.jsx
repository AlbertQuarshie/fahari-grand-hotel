import { useEffect, useState } from "react";
import { getReviews, approveReview, deleteReview } from "../../api/admin.api";
import { Star, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

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
    // Force full refresh to get updated data from backend
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

  const pending = reviews.filter((r) => !r.is_approved).length;
  const approved = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Review Moderation</h2>
          <p className="text-slate-400 text-sm mt-1">
            Approve or remove guest reviews before they go public.
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition self-start"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: reviews.length, color: "text-white" },
          { label: "Pending", value: pending, color: "text-amber-400" },
          { label: "Approved", value: approved, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <p className={`font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 w-fit">
        {["all", "pending", "approved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              filter === f
                ? "bg-amber-400 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Star size={36} className="mx-auto mb-3 opacity-30" />
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`bg-slate-800 rounded-2xl border p-5 space-y-3 transition ${
                review.is_approved
                  ? "border-green-500/20"
                  : "border-amber-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {review.guest_username?.[0]?.toUpperCase() || "G"}
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {review.guest_username || `Guest #${review.guest}`}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      Room {review.room_number || review.room}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      review.is_approved
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                      />
                    ))}
                    <span className="text-slate-400 text-xs ml-1">{review.rating}/5</span>
                  </div>
                </div>

                <p className="text-slate-500 text-xs">
                  {new Date(review.created_at).toLocaleDateString("en-KE", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>

              {review.comment && (
                <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-slate-600 pl-3">
                  "{review.comment}"
                </p>
              )}

              <div className="flex gap-2 pt-1">
                {!review.is_approved && (
            <button
            onClick={() => handleApprove(review.id)}
            disabled={actioning === review.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-semibold transition disabled:opacity-50"
                >
            <CheckCircle size={14} />
            {actioning === review.id ? "Approving..." : "Approve"}
             </button>
            )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actioning === review.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-semibold transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {actioning === review.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;