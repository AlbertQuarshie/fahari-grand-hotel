import { useEffect, useState, useCallback, useMemo } from "react";
import { getMyBookings } from "../../api/bookings.api";
import { checkInOut } from "../../api/receptionist.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  pageTitle,
  pageSubtitle,
  card,
  filterBar,
  input,
  btnNavy,
  btnOutline,
  btnGhost,
  emptyState,
  skeleton,
  badge,
  display,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 8;

const CheckInOut = () => {
  usePageTitle("Check In / Check Out");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      const active = data.filter((b) =>
        ["confirmed", "checked_in"].includes(b.status)
      );
      setBookings(active);
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 0);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.booking_reference.toLowerCase().includes(q) ||
        b.guest_username.toLowerCase().includes(q) ||
        b.room_number.includes(q)
    );
  }, [search, bookings]);

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(filteredBookings, ITEMS_PER_PAGE);

  const handleAction = async (bookingId, action) => {
    setActionLoading(bookingId);
    try {
      const res = await checkInOut(bookingId, action);
      toast.success(res.detail);
      await fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={pageTitle}>Check In / Out</h2>
        <p className={pageSubtitle}>
          Process guest check-ins and check-outs.
        </p>
      </div>

      <div className={filterBar}>
        <input
          type="text"
          placeholder="Search by guest, room or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 min-w-[200px] ${input}`}
        />
        <button
          onClick={fetchBookings}
          className={`px-4 py-2 rounded text-sm ${btnGhost}`}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-20 ${skeleton}`} />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className={emptyState}>
          <p>No active bookings found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedItems.map((booking) => (
              <div
                key={booking.id}
                className={`${card} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`${display} text-[#0B1F3A] font-bold`}>
                      Room {booking.room_number}
                    </span>
                    <span className={badge(booking.status)}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[#0B1F3A] text-sm font-semibold">
                    Guest: {booking.guest_username}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#0B1F3A]/70 font-semibold">
                    <span className="font-mono">{booking.booking_reference}</span>
                    <span>{booking.check_in_date} → {booking.check_out_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`${display} text-[#0B1F3A] font-bold text-sm`}>
                    KES {parseFloat(booking.total_price).toLocaleString()}
                  </span>

                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleAction(booking.id, "check_in")}
                      disabled={actionLoading === booking.id}
                      className={`px-4 py-2 rounded text-sm ${btnNavy} disabled:opacity-50`}
                    >
                      {actionLoading === booking.id ? "..." : "Check In"}
                    </button>
                  )}

                  {booking.status === "checked_in" && (
                    <button
                      onClick={() => handleAction(booking.id, "check_out")}
                      disabled={actionLoading === booking.id}
                      className={`px-4 py-2 rounded text-sm ${btnOutline} disabled:opacity-50`}
                    >
                      {actionLoading === booking.id ? "..." : "Check Out"}
                    </button>
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

export default CheckInOut;
