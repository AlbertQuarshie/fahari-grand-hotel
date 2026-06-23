import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../api/bookings.api";
import { CalendarCheck, X, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  checked_in: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  checked_out: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled.");
      await fetchBookings();
    } catch {
      toast.error("Could not cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-800 rounded-2xl animate-pulse border border-slate-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Bookings</h2>
        <p className="text-slate-400 text-sm mt-1">
          View and manage your reservations.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-40" />
          <p>You have no bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-white font-bold text-base">
                    Room {booking.room_number}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyles[booking.status] || statusStyles.pending}`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Ref:{" "}
                  <span className="text-slate-300 font-mono">
                    {booking.booking_reference}
                  </span>
                </p>
                <p className="text-slate-400 text-sm">
                  {booking.check_in_date} → {booking.check_out_date}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-right">
                  <p className="text-amber-400 font-bold text-lg">
                    KES {parseFloat(booking.total_price).toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs">total</p>
                </div>

                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => navigate(`/guest/pay/${booking.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm transition"
                    >
                      <CreditCard size={14} />
                      Pay Now
                    </button>

                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm transition disabled:opacity-50"
                    >
                      <X size={14} />
                      {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;