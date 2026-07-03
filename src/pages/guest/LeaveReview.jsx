import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getMyBookings } from "../../api/bookings.api";
import { getMyReviews, submitReview } from "../../api/reviews.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, pageTitle, pageSubtitle, card, cardHover,
  btnPrimary, emptyState, skeleton, badge,
} from "../../constants/theme";

const REVIEWS_PER_PAGE = 5;

const LeaveReview = () => {
  usePageTitle("Leave a Review");
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(myReviews, REVIEWS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [bookings, reviews] = await Promise.all([
          getMyBookings(),
          getMyReviews(),
        ]);
        if (!cancelled) {
          const reviewedBookingIds = new Set(reviews.map((r) => r.booking));
          const eligible = bookings.filter(
            (b) => b.status === "checked_out" && !reviewedBookingIds.has(b.id)
          );
          setEligibleBookings(eligible);
          setMyReviews(reviews);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load bookings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    if (!selected) { toast.error("Please select a booking to review."); return; }
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    if (!comment.trim()) { toast.error("Please write a comment."); return; }

    setSubmitting(true);
    try {
      const newReview = await submitReview({
        room: selected.room,
        booking: selected.id,
        rating,
        comment: comment.trim(),
      });
      setMyReviews((prev) => [newReview, ...prev]);
      setEligibleBookings((prev) => prev.filter((b) => b.id !== selected.id));
      setSuccess(true);
      setSelected(null);
      setRating(0);
      setComment("");
      toast.success("Review submitted! It will appear once approved.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReview = () => setSuccess(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-20 ${skeleton}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className={pageTitle}>Leave a Review</h2>
        <p className={pageSubtitle}>Share your experience to help other guests.</p>
      </div>

      {success && (
        <div className={`${card} border-emerald-400 p-8 text-center space-y-4`}>
          <p className={`${display} text-emerald-800 font-bold text-xl`}>Thank You!</p>
          <p className="text-[#0B1F3A] text-sm font-semibold">
            Your review has been submitted and will appear once approved by our team.
          </p>
          {eligibleBookings.length > 0 && (
            <button
              onClick={handleNewReview}
              className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
            >
              Review Another Stay
            </button>
          )}
        </div>
      )}

      {!success && (
        <>
          {eligibleBookings.length === 0 ? (
            <div className={emptyState}>
              <p className="font-bold">No stays to review</p>
              <p className="text-sm mt-1">Reviews are available after you check out.</p>
            </div>
          ) : (
            <div className={`${card} p-6 space-y-6`}>
              <div className="space-y-3">
                <label className="block text-[#0B1F3A] text-sm font-bold">
                  Select Your Stay
                </label>
                <div className="space-y-2">
                  {eligibleBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelected(booking)}
                      className={`w-full text-left p-4 rounded border transition ${
                        selected?.id === booking.id
                          ? "border-[#C9A24B] bg-[#C9A24B]/10"
                          : "border-[#0B1F3A]/10 hover:border-[#C9A24B] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[#0B1F3A] font-bold">
                            Room {booking.room_number}
                          </p>
                          <p className="text-[#0B1F3A] text-xs mt-0.5 font-semibold">
                            {booking.check_in_date} → {booking.check_out_date}
                          </p>
                          <p className="text-[#0B1F3A] text-xs font-mono font-semibold">
                            {booking.booking_reference}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected?.id === booking.id
                            ? "border-[#C9A24B] bg-[#C9A24B]"
                            : "border-[#0B1F3A]/30"
                        }`}>
                          {selected?.id === booking.id && (
                            <div className="w-2 h-2 rounded-full bg-[#0B1F3A]" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[#0B1F3A] text-sm font-bold">
                  Your Rating
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= (hovered || rating)
                            ? "text-[#C9A24B] fill-[#C9A24B]"
                            : "text-[#0B1F3A]/20"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-[#0B1F3A] text-sm font-semibold ml-2">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[#0B1F3A] text-sm font-bold">
                  Your Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your stay — what did you love? What could be improved?"
                  className="w-full px-4 py-3 rounded bg-white text-[#0B1F3A] border border-[#0B1F3A]/20 focus:border-[#C9A24B] focus:outline-none text-sm resize-none font-semibold"
                />
                <p className="text-[#0B1F3A] text-xs text-right font-semibold">{comment.length} characters</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selected || rating === 0}
                className={`w-full py-3 rounded text-sm ${btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </>
      )}

      {myReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className={`${display} text-[#0B1F3A] font-bold`}>My Past Reviews</h3>
          {paginatedItems.map((review) => (
            <div key={review.id} className={`${cardHover} p-5 space-y-3`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <p className="text-[#0B1F3A] font-bold">Room {review.room_number}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? "text-[#C9A24B] fill-[#C9A24B]" : "text-[#0B1F3A]/20"}
                      />
                    ))}
                  </div>
                </div>
                <span className={badge(review.is_approved ? "confirmed" : "pending")}>
                  {review.is_approved ? "Published" : "Pending approval"}
                </span>
              </div>
              {review.comment && (
                <p className="text-[#0B1F3A] text-sm italic font-semibold">&ldquo;{review.comment}&rdquo;</p>
              )}
              <p className="text-[#0B1F3A] text-xs font-semibold">
                {new Date(review.created_at).toLocaleDateString("en-KE", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={REVIEWS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
};

export default LeaveReview;
