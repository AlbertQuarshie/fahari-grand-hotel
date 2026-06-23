import { useEffect, useState } from "react";
import { createMaintenanceRequest, getMyMaintenanceRequests } from "../../api/maintenance.api";
import { getMyBookings } from "../../api/bookings.api";
import { Wrench, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const priorityStyles = {
  low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const statusStyles = {
  open: "bg-red-500/10 text-red-400 border border-red-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  resolved: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const ReportIssue = () => {
  const [rooms, setRooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    room: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [bookings, existing] = await Promise.all([
          getMyBookings(),
          getMyMaintenanceRequests(),
        ]);

        if (!cancelled) {
          // extract unique rooms from active bookings
          const activeRooms = bookings
            .filter((b) => ["confirmed", "checked_in"].includes(b.status))
            .map((b) => ({ id: b.room, room_number: b.room_number }))
            .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);

          setRooms(activeRooms);
          setRequests(existing);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.room || !form.description.trim()) {
      toast.error("Please select a room and describe the issue.");
      return;
    }
    setSubmitting(true);
    try {
      const newRequest = await createMaintenanceRequest({
        room: parseInt(form.room),
        description: form.description.trim(),
        priority: form.priority,
      });
      setRequests((prev) => [newRequest, ...prev]);
      setSuccess(true);
      setForm({ room: "", description: "", priority: "medium" });
      toast.success("Issue reported successfully.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Report an Issue</h2>
        <p className="text-slate-400 text-sm mt-1">
          Let us know about any problems in your room and we'll fix it promptly.
        </p>
      </div>

      {/* Report form */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Wrench size={16} className="text-amber-400" />
          Submit a Maintenance Request
        </h3>

        {/* Room select */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">Room</label>
          {rooms.length === 0 ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              <AlertTriangle size={15} className="text-amber-400 shrink-0" />
              <p className="text-amber-400 text-sm">
                You need an active booking to report an issue.
              </p>
            </div>
          ) : (
            <select
              name="room"
              value={form.room}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            >
              <option value="">— Select your room —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">Priority</label>
          <div className="flex gap-3">
            {["low", "medium", "high"].map((p) => (
              <button
                key={p}
                onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition border ${
                  form.priority === p
                    ? priorityStyles[p]
                    : "border-slate-600 text-slate-500 hover:border-slate-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm resize-none"
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <CheckCircle size={15} className="text-green-400 shrink-0" />
            <p className="text-green-400 text-sm">
              Issue reported! Our team will attend to it shortly.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || rooms.length === 0}
          className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">My Past Reports</h3>
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-white font-semibold">Room {req.room_number}</p>
                  <p className="text-slate-300 text-sm mt-0.5">{req.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${priorityStyles[req.priority]}`}>
                    {req.priority}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[req.status] || statusStyles.open}`}>
                    {req.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-xs">
                Reported:{" "}
                {new Date(req.created_at).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportIssue;