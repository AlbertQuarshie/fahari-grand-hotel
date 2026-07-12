import { useEffect, useState, useCallback } from "react";
import { getDailyRoster, checkInOut, confirmBooking } from "../../api/receptionist.api";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  pageTitle, pageSubtitle, sectionLabel, card, badge,
  btnPrimary, btnNavy, btnOutline, input, emptyState, skeleton, display,
} from "../../constants/theme";

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-[#0B1F3A]/10 last:border-0">
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
        <p className="text-[#0B1F3A]/70 text-xs tracking-wide font-semibold">
          {booking.booking_reference}
        </p>
        <p className="text-[#0B1F3A]/70 text-xs font-semibold">
          {booking.check_in_date} → {booking.check_out_date}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`${display} text-[#0B1F3A] font-bold text-sm`}>
          KES {parseFloat(booking.total_price).toLocaleString()}
        </span>

        {booking.status === "pending" && (
          <button
            onClick={() => handleAction("confirm")}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}
          >
            {loading ? "..." : "Confirm"}
          </button>
        )}

        {booking.status === "confirmed" && (
          <button
            onClick={() => handleAction("check_in")}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-sm ${btnNavy} disabled:opacity-50`}
          >
            {loading ? "..." : "Check In"}
          </button>
        )}

        {booking.status === "checked_in" && (
          <button
            onClick={() => handleAction("check_out")}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-sm ${btnOutline} disabled:opacity-50`}
          >
            {loading ? "..." : "Check Out"}
          </button>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, bookings, onAction, emptyMsg }) => (
  <div className={`${card} overflow-hidden`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#0B1F3A]/10 bg-[#FAF8F3]">
      <div>
        <p className={sectionLabel}>{subtitle}</p>
        <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>{title}</h3>
      </div>
      <span className="bg-[#0B1F3A] text-white text-xs font-bold px-2.5 py-1 rounded">
        {bookings.length}
      </span>
    </div>
    <div className="px-5">
      {bookings.length === 0 ? (
        <p className={`${emptyState} py-8 text-sm`}>{emptyMsg}</p>
      ) : (
        bookings.map((b) => (
          <BookingRow key={b.id} booking={b} onAction={onAction} />
        ))
      )}
    </div>
  </div>
);

const Roster = () => {
  usePageTitle("Daily Roster");
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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
    return () => { cancelled = true; };
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
      {/* Header row with profile button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Daily Roster</h2>
          <p className={pageSubtitle}>
            Manage check-ins, check-outs, and current guests.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={input}
          />
          
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-40 ${skeleton}`} />
          ))}
        </div>
      ) : roster ? (
        <div className="space-y-5">
          <SectionCard
            title="Checking In Today"
            subtitle="Arrivals"
            bookings={roster.checking_in}
            onAction={handleAction}
            emptyMsg="No check-ins scheduled for today."
          />
          <SectionCard
            title="Checking Out Today"
            subtitle="Departures"
            bookings={roster.checking_out}
            onAction={handleAction}
            emptyMsg="No check-outs scheduled for today."
          />
          <SectionCard
            title="Currently Checked In"
            subtitle="In-house guests"
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