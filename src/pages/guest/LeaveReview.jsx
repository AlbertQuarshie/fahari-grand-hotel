import { useEffect, useState } from "react";
import { getMyBookings } from "../../api/bookings.api";
import { getMyReviews, submitReview } from "../../api/reviews.api";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const LeaveReview = () => {
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
          <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Leave a Review</h2>
        <p className="text-slate-400 text-sm mt-1">
          Share your experience to help other guests.
        </p>
      </div>

      {/* Success state */}
      {success && (
        <div className="bg-slate-800 rounded-2xl border border-green-500/30 p-8 text-center space-y-4">
          <CheckCircle size={48} className="text-green-400 mx-auto" />
          <p className="text-white font-bold text-xl">Thank You!</p>
          <p className="text-slate-400 text-sm">
            Your review has been submitted and will appear once approved by our team.
          </p>
          {eligibleBookings.length > 0 && (
            <button
              onClick={handleNewReview}
              className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
            >
              Review Another Stay
            </button>
          )}
        </div>
      )}

      {/* Review form */}
      {!success && (
        <>
          {eligibleBookings.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-400">No stays to review</p>
              <p className="text-sm mt-1">
                Reviews are available after you check out.
              </p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-6">

              {/* Select booking */}
              <div className="space-y-3">
                <label className="block text-slate-300 text-sm font-semibold">
                  Select Your Stay
                </label>
                <div className="space-y-2">
                  {eligibleBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelected(booking)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        selected?.id === booking.id
                          ? "border-amber-400 bg-amber-400/5"
                          : "border-slate-700 hover:border-slate-600 bg-slate-700/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">
                            Room {booking.room_number}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {booking.check_in_date} → {booking.check_out_date}
                          </p>
                          <p className="text-slate-500 text-xs font-mono">
                            {booking.booking_reference}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected?.id === booking.id
                            ? "border-amber-400 bg-amber-400"
                            : "border-slate-600"
                        }`}>
                          {selected?.id === booking.id && (
                            <div className="w-2 h-2 rounded-full bg-slate-900" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div className="space-y-3">
                <label className="block text-slate-300 text-sm font-semibold">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hovered || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-slate-400 text-sm self-center ml-2">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="block text-slate-300 text-sm font-semibold">
                  Your Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your stay — what did you love? What could be improved?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm resize-none"
                />
                <p className="text-slate-500 text-xs text-right">{comment.length} characters</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selected || rating === 0}
                className="w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Past reviews */}
      {myReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">My Past Reviews</h3>
          {myReviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <p className="text-white font-semibold">Room {review.room_number}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                      />
                    ))}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  review.is_approved
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {review.is_approved ? "Published" : "Pending approval"}
                </span>
              </div>
              {review.comment && (
                <p className="text-slate-400 text-sm italic">"{review.comment}"</p>
              )}
              <p className="text-slate-500 text-xs">
                {new Date(review.created_at).toLocaleDateString("en-KE", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveReview;