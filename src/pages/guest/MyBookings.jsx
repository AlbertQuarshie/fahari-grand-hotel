import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../api/bookings.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  pageTitle, pageSubtitle, card, btnNavy, btnOutline,
  emptyState, skeleton, badge, display,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 8;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(bookings, ITEMS_PER_PAGE);

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
          <div key={i} className={`h-28 ${skeleton}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={pageTitle}>My Bookings</h2>
        <p className={pageSubtitle}>View and manage your reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className={emptyState}>
          <p>You have no bookings yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedItems.map((booking) => (
              <div
                key={booking.id}
                className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className={`${display} text-[#0B1F3A] font-bold text-base`}>
                      Room {booking.room_number}
                    </p>
                    <span className={badge(booking.status)}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[#0B1F3A] text-sm font-semibold">
                    Ref:{" "}
                    <span className="font-mono">{booking.booking_reference}</span>
                  </p>
                  <p className="text-[#0B1F3A] text-sm font-semibold">
                    {booking.check_in_date} → {booking.check_out_date}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className={`${display} text-[#0B1F3A] font-bold text-lg`}>
                      KES {parseFloat(booking.total_price).toLocaleString()}
                    </p>
                    <p className="text-[#0B1F3A] text-xs font-semibold">total</p>
                  </div>

                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => navigate(`/guest/pay/${booking.id}`)}
                        className={`px-3 py-1.5 rounded text-sm ${btnNavy}`}
                      >
                        Pay Now
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        className={`px-3 py-1.5 rounded text-sm ${btnOutline} disabled:opacity-50`}
                      >
                        {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    </>
                  )}
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

export default MyBookings;
