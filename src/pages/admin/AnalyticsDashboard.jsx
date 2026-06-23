import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/admin.api";
import {
  BedDouble, Users, CalendarCheck, CreditCard,
  TrendingUp, Star, Wrench, CheckSquare, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/20",
  checked_in: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  checked_out: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-slate-400 text-sm">{title}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
    </div>
    <p className="text-white font-bold text-3xl">{value}</p>
    {sub && <p className="text-slate-500 text-xs">{sub}</p>}
  </div>
);

const AnalyticsDashboard = () => {
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
            <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
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
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">
            Live overview of Fahari Grand Hotel & Suites.
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Revenue */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Revenue
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Daily Revenue"
            value={`KES ${data.revenue.daily.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-amber-400/10 text-amber-400"
          />
          <StatCard
            title="Weekly Revenue"
            value={`KES ${data.revenue.weekly.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-amber-400/10 text-amber-400"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KES ${data.revenue.monthly.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-amber-400/10 text-amber-400"
          />
        </div>
      </div>

      {/* Bookings + Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold">Bookings</h3>
            <span className="ml-auto text-amber-400 font-bold">{data.bookings.total} total</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Pending", value: data.bookings.pending, color: "bg-amber-400" },
              { label: "Confirmed", value: data.bookings.confirmed, color: "bg-green-400" },
              { label: "Checked In", value: data.bookings.checked_in, color: "bg-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${data.bookings.total ? (value / data.bookings.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BedDouble size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold">Rooms</h3>
            <span className="ml-auto text-amber-400 font-bold">{data.rooms.total} total</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Available", value: data.rooms.available, color: "bg-green-400" },
              { label: "Occupied", value: data.rooms.occupied, color: "bg-blue-400" },
              { label: "Cleaning", value: data.rooms.cleaning, color: "bg-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${data.rooms.total ? (value / data.rooms.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
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
          icon={Users}
          color="bg-blue-400/10 text-blue-400"
        />
        <StatCard
          title="Payments Completed"
          value={data.payments.completed}
          sub={`${data.payments.pending} pending · ${data.payments.failed} failed`}
          icon={CreditCard}
          color="bg-green-400/10 text-green-400"
        />
        <StatCard
          title="Reviews"
          value={data.reviews.approved}
          sub={`${data.reviews.pending_approval} awaiting approval`}
          icon={Star}
          color="bg-amber-400/10 text-amber-400"
        />
        <StatCard
          title="Maintenance"
          value={data.maintenance.open + data.maintenance.in_progress}
          sub={`${data.maintenance.resolved} resolved`}
          icon={Wrench}
          color="bg-red-400/10 text-red-400"
        />
      </div>

      {/* Housekeeping + Payments side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housekeeping */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold">Housekeeping</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dirty", value: data.housekeeping.dirty, color: "text-red-400" },
              { label: "In Progress", value: data.housekeeping.cleaning, color: "text-amber-400" },
              { label: "Clean", value: data.housekeeping.clean, color: "text-green-400" },
              { label: "Inspected", value: data.housekeeping.inspected, color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className={`font-bold text-2xl ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff breakdown */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold">Staff Breakdown</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Guests", value: data.staff.guests, color: "bg-slate-400" },
              { label: "Receptionists", value: data.staff.receptionists, color: "bg-blue-400" },
              { label: "Housekeepers", value: data.staff.housekeepers, color: "bg-green-400" },
              { label: "Admins", value: data.staff.admins, color: "bg-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-slate-400 text-sm">{label}</span>
                </div>
                <span className="text-white font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
          <CalendarCheck size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {data.recent_bookings.map((booking) => (
            <div
              key={booking.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
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
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-bold">
                  KES {parseFloat(booking.total_price).toLocaleString()}
                </p>
                <p className="text-slate-500 text-xs">
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