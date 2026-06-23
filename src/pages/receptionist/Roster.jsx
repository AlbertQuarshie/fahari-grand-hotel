import { useEffect, useState, useCallback } from "react";
import { getDailyRoster, checkInOut, confirmBooking } from "../../api/receptionist.api";
import { LogIn, LogOut, Users, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const statusStyles = {
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/20",
  checked_in: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  checked_out: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const BookingRow = ({ booking, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onAction(booking.id, action);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-slate-700/50 last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold">Room {booking.room_number}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${statusStyles[booking.status] || statusStyles.pending}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          Guest: <span className="text-slate-300">{booking.guest_username}</span>
        </p>
        <p className="text-slate-500 text-xs font-mono">{booking.booking_reference}</p>
        <p className="text-slate-500 text-xs">
          {booking.check_in_date} → {booking.check_out_date}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold text-sm">
          KES {parseFloat(booking.total_price).toLocaleString()}
        </span>

        {booking.status === "pending" && (
          <button
            onClick={() => handleAction("confirm")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm transition disabled:opacity-50"
          >
            <CheckCircle size={14} />
            {loading ? "..." : "Confirm"}
          </button>
        )}

        {booking.status === "confirmed" && (
          <button
            onClick={() => handleAction("check_in")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-sm transition disabled:opacity-50"
          >
            <LogIn size={14} />
            {loading ? "..." : "Check In"}
          </button>
        )}

        {booking.status === "checked_in" && (
          <button
            onClick={() => handleAction("check_out")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-300 border border-slate-500/20 hover:bg-slate-500/20 text-sm transition disabled:opacity-50"
          >
            <LogOut size={14} />
            {loading ? "..." : "Check Out"}
          </button>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, color, bookings, onAction, emptyMsg }) => (
  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
    <div className={`flex items-center gap-3 px-5 py-4 border-b border-slate-700 ${color}`}>
      <Icon size={18} />
      <h3 className="font-semibold">{title}</h3>
      <span className="ml-auto bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
        {bookings.length}
      </span>
    </div>
    <div className="px-5">
      {bookings.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">{emptyMsg}</p>
      ) : (
        bookings.map((b) => (
          <BookingRow key={b.id} booking={b} onAction={onAction} />
        ))
      )}
    </div>
  </div>
);

const Roster = () => {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // For manual refresh button and handleAction
  const fetchRoster = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyRoster(date);
      setRoster(data);
    } catch {
      toast.error("Failed to load roster.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Initial load — inlined to satisfy React Compiler
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDailyRoster(date);
        if (!cancelled) setRoster(data);
      } catch {
        if (!cancelled) toast.error("Failed to load roster.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const handleAction = async (bookingId, action) => {
    try {
      if (action === "confirm") {
        await confirmBooking(bookingId);
        toast.success("Booking confirmed.");
      } else {
        const res = await checkInOut(bookingId, action);
        toast.success(res.detail);
      }
      await fetchRoster();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Roster</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage check-ins, check-outs, and current guests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-400 focus:outline-none"
          />
          <button
            onClick={fetchRoster}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-slate-800 rounded-2xl animate-pulse border border-slate-700"
            />
          ))}
        </div>
      ) : roster ? (
        <div className="space-y-5">
          <SectionCard
            title="Checking In Today"
            icon={LogIn}
            color="text-green-400"
            bookings={roster.checking_in}
            onAction={handleAction}
            emptyMsg="No check-ins scheduled for today."
          />
          <SectionCard
            title="Checking Out Today"
            icon={LogOut}
            color="text-slate-300"
            bookings={roster.checking_out}
            onAction={handleAction}
            emptyMsg="No check-outs scheduled for today."
          />
          <SectionCard
            title="Currently Checked In"
            icon={Users}
            color="text-blue-400"
            bookings={roster.currently_checked_in}
            onAction={handleAction}
            emptyMsg="No guests currently checked in."
          />
        </div>
      ) : null}
    </div>
  );
};

export default Roster;