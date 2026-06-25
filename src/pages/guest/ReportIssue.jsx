import { useEffect, useState } from "react";
import { createMaintenanceRequest, getMyMaintenanceRequests } from "../../api/maintenance.api";
import { getMyBookings } from "../../api/bookings.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  display, pageTitle, pageSubtitle, card, select,
  btnPrimary, emptyState, skeleton, badge,
} from "../../constants/theme";

const REQUESTS_PER_PAGE = 6;

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

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(requests, REQUESTS_PER_PAGE);

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
          <div key={i} className={`h-20 ${skeleton}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className={pageTitle}>Report an Issue</h2>
        <p className={pageSubtitle}>
          Let us know about any problems in your room and we&apos;ll fix it promptly.
        </p>
      </div>

      <div className={`${card} p-6 space-y-5`}>
        <h3 className={`${display} text-[#0B1F3A] font-bold`}>
          Submit a Maintenance Request
        </h3>

        <div>
          <label className="block text-[#0B1F3A] text-sm font-bold mb-2">Room</label>
          {rooms.length === 0 ? (
            <div className="bg-amber-100 border border-amber-400 rounded px-4 py-3">
              <p className="text-amber-900 text-sm font-bold">
                You need an active booking to report an issue.
              </p>
            </div>
          ) : (
            <select
              name="room"
              value={form.room}
              onChange={handleChange}
              className={`${select} w-full py-2.5`}
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

        <div>
          <label className="block text-[#0B1F3A] text-sm font-bold mb-2">Priority</label>
          <div className="flex gap-3">
            {["low", "medium", "high"].map((p) => (
              <button
                key={p}
                onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                className={`flex-1 py-2 rounded text-sm font-bold capitalize transition border ${
                  form.priority === p
                    ? badge(p)
                    : "border-[#0B1F3A]/20 text-[#0B1F3A]/50 hover:border-[#0B1F3A]/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#0B1F3A] text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-4 py-3 rounded bg-white text-[#0B1F3A] border border-[#0B1F3A]/20 focus:border-[#C9A24B] focus:outline-none text-sm resize-none font-semibold"
          />
        </div>

        {success && (
          <div className="bg-emerald-100 border border-emerald-400 rounded px-4 py-3">
            <p className="text-emerald-900 text-sm font-bold">
              Issue reported! Our team will attend to it shortly.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || rooms.length === 0}
          className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>

      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className={`${display} text-[#0B1F3A] font-bold`}>My Past Reports</h3>
          {paginatedItems.map((req) => (
            <div key={req.id} className={`${card} p-4 space-y-2`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[#0B1F3A] font-bold">Room {req.room_number}</p>
                  <p className="text-[#0B1F3A] text-sm mt-0.5 font-semibold">{req.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={badge(req.priority)}>{req.priority}</span>
                  <span className={badge(req.status)}>{req.status.replace("_", " ")}</span>
                </div>
              </div>
              <p className="text-[#0B1F3A] text-xs font-semibold">
                Reported:{" "}
                {new Date(req.created_at).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={REQUESTS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
