import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/admin.api";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, pageTitle, pageSubtitle, sectionLabel, card,
  btnOutline, skeleton, badge,
} from "../../constants/theme";

const StatCard = ({ title, value, sub }) => (
  <div className={`${card} p-5 space-y-2`}>
    <p className="text-[#0B1F3A]/60 text-sm font-semibold">{title}</p>
    <p className={`${display} text-[#0B1F3A] font-bold text-3xl`}>{value}</p>
    {sub && <p className="text-[#0B1F3A]/50 text-xs font-semibold">{sub}</p>}
  </div>
);

const ProgressBar = ({ label, value, total, barColor }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-[#0B1F3A]/70 font-semibold">{label}</span>
      <span className="text-[#0B1F3A] font-bold">{value}</span>
    </div>
    <div className="h-1.5 bg-[#0B1F3A]/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${barColor} rounded-full transition-all`}
        style={{ width: `${total ? (value / total) * 100 : 0}%` }}
      />
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  usePageTitle("Admin Dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminDashboard();
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) toast.error("Failed to load dashboard.");
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
      const res = await getAdminDashboard();
      setData(res);
    } catch {
      toast.error("Failed to refresh.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-28 ${skeleton}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={pageTitle}>Admin Dashboard</h2>
          <p className={pageSubtitle}>
            Live overview of Fahari Grand Hotel & Suites.
          </p>
        </div>
        <button
          onClick={refresh}
          className={`px-4 py-2 rounded text-sm ${btnOutline}`}
        >
          Refresh
        </button>
      </div>

      {/* Revenue */}
      <div>
        <p className={`${sectionLabel} mb-3`}>Revenue</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Daily Revenue"
            value={`KES ${data.revenue.daily.toLocaleString()}`}
          />
          <StatCard
            title="Weekly Revenue"
            value={`KES ${data.revenue.weekly.toLocaleString()}`}
          />
          <StatCard
            title="Monthly Revenue"
            value={`KES ${data.revenue.monthly.toLocaleString()}`}
          />
        </div>
      </div>

      {/* Bookings + Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Bookings</h3>
            <span className="text-[#C9A24B] font-bold text-sm">{data.bookings.total} total</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Pending", value: data.bookings.pending, barColor: "bg-amber-400" },
              { label: "Confirmed", value: data.bookings.confirmed, barColor: "bg-emerald-500" },
              { label: "Checked In", value: data.bookings.checked_in, barColor: "bg-blue-500" },
            ].map(({ label, value, barColor }) => (
              <ProgressBar
                key={label}
                label={label}
                value={value}
                total={data.bookings.total}
                barColor={barColor}
              />
            ))}
          </div>
        </div>

        {/* Rooms */}
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Rooms</h3>
            <span className="text-[#C9A24B] font-bold text-sm">{data.rooms.total} total</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Available", value: data.rooms.available, barColor: "bg-emerald-500" },
              { label: "Occupied", value: data.rooms.occupied, barColor: "bg-blue-500" },
              { label: "Cleaning", value: data.rooms.cleaning, barColor: "bg-amber-400" },
            ].map(({ label, value, barColor }) => (
              <ProgressBar
                key={label}
                label={label}
                value={value}
                total={data.rooms.total}
                barColor={barColor}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={data.staff.total}
          sub={`${data.staff.receptionists} receptionists · ${data.staff.housekeepers} housekeepers`}
        />
        <StatCard
          title="Payments Completed"
          value={data.payments.completed}
          sub={`${data.payments.pending} pending · ${data.payments.failed} failed`}
        />
        <StatCard
          title="Reviews"
          value={data.reviews.approved}
          sub={`${data.reviews.pending_approval} awaiting approval`}
        />
        <StatCard
          title="Maintenance"
          value={data.maintenance.open + data.maintenance.in_progress}
          sub={`${data.maintenance.resolved} resolved`}
        />
      </div>

      {/* Housekeeping + Staff breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housekeeping */}
        <div className={`${card} p-5 space-y-4`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Housekeeping</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dirty", value: data.housekeeping.dirty, color: "text-red-700" },
              { label: "In Progress", value: data.housekeeping.cleaning, color: "text-[#C9A24B]" },
              { label: "Clean", value: data.housekeeping.clean, color: "text-emerald-700" },
              { label: "Inspected", value: data.housekeeping.inspected, color: "text-blue-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#FAF8F3] rounded border border-[#0B1F3A]/10 p-3 text-center">
                <p className={`${display} font-bold text-2xl ${color}`}>{value}</p>
                <p className="text-[#0B1F3A]/60 text-xs mt-1 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff breakdown */}
        <div className={`${card} p-5 space-y-4`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Staff Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Guests", value: data.staff.guests, dotColor: "bg-[#0B1F3A]/40" },
              { label: "Receptionists", value: data.staff.receptionists, dotColor: "bg-blue-500" },
              { label: "Housekeepers", value: data.staff.housekeepers, dotColor: "bg-emerald-500" },
              { label: "Admins", value: data.staff.admins, dotColor: "bg-[#C9A24B]" },
            ].map(({ label, value, dotColor }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="text-[#0B1F3A]/70 text-sm font-semibold">{label}</span>
                </div>
                <span className="text-[#0B1F3A] font-bold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-[#0B1F3A]/10">
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Recent Bookings</h3>
        </div>
        <div className="divide-y divide-[#0B1F3A]/10">
          {data.recent_bookings.map((booking) => (
            <div
              key={booking.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#0B1F3A] font-bold">Room {booking.room_number}</span>
                  <span className={badge(booking.status)}>
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[#0B1F3A]/70 text-sm font-semibold">
                  Guest: <span className="text-[#0B1F3A]">{booking.guest_username}</span>
                </p>
                <p className="text-[#0B1F3A]/50 text-xs tracking-wide">{booking.booking_reference}</p>
              </div>
              <div className="text-right">
                <p className="text-[#C9A24B] font-bold">
                  KES {parseFloat(booking.total_price).toLocaleString()}
                </p>
                <p className="text-[#0B1F3A]/50 text-xs font-semibold">
                  {booking.check_in_date} → {booking.check_out_date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;