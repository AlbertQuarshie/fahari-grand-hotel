import { useEffect, useState, useCallback, useMemo } from "react";
import { getMyBookings } from "../../api/bookings.api";
import { checkInOut } from "../../api/receptionist.api";
import { LogIn, LogOut, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const statusStyles = {
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/20",
  checked_in: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  checked_out: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const CheckInOut = () => {
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
        <h2 className="text-2xl font-bold text-white">Check In / Out</h2>
        <p className="text-slate-400 text-sm mt-1">
          Process guest check-ins and check-outs.
        </p>
      </div>

      {/* Search + refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by guest, room or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-400 focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <LogIn size={36} className="mx-auto mb-3 opacity-30" />
          <p>No active bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-bold">Room {booking.room_number}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${statusStyles[booking.status]}`}>
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Guest: <span className="text-slate-300">{booking.guest_username}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">{booking.booking_reference}</span>
                  <span>{booking.check_in_date} → {booking.check_out_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold text-sm">
                  KES {parseFloat(booking.total_price).toLocaleString()}
                </span>

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleAction(booking.id, "check_in")}
                    disabled={actionLoading === booking.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-sm font-semibold transition disabled:opacity-50"
                  >
                    <LogIn size={15} />
                    {actionLoading === booking.id ? "..." : "Check In"}
                  </button>
                )}

                {booking.status === "checked_in" && (
                  <button
                    onClick={() => handleAction(booking.id, "check_out")}
                    disabled={actionLoading === booking.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-600/30 text-slate-300 border border-slate-600 hover:bg-slate-600/50 text-sm font-semibold transition disabled:opacity-50"
                  >
                    <LogOut size={15} />
                    {actionLoading === booking.id ? "..." : "Check Out"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInOut;