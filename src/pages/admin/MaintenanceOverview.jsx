import { useEffect, useState } from "react";
import {
  getAllMaintenance, updateMaintenanceStatus,
  getAllHousekeeping, createHousekeepingTask, updateHousekeepingTask,
} from "../../api/admin.api";
import { getStaffList } from "../../api/staff.api";
import { getAllRooms } from "../../api/admin.api";
import { Wrench, CheckSquare, RefreshCw, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

const priorityStyles = {
  low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const maintenanceStatusStyles = {
  open: "bg-red-500/10 text-red-400 border border-red-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  resolved: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const housekeepingStatusStyles = {
  dirty: "bg-red-500/10 text-red-400 border border-red-500/20",
  cleaning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  clean: "bg-green-500/10 text-green-400 border border-green-500/20",
  inspected: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

const AssignModal = ({ rooms, housekeepers, onClose, onSave }) => {
  const [form, setForm] = useState({ room: "", housekeeper: "", status: "dirty", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.room || !form.housekeeper) {
      toast.error("Please select a room and housekeeper.");
      return;
    }
    setSubmitting(true);
    try {
      await onSave({ room: parseInt(form.room), housekeeper: parseInt(form.housekeeper), status: form.status, notes: form.notes });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold">Assign Housekeeping Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Room *</label>
            <select name="room" value={form.room} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm">
              <option value="">— Select room —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Housekeeper *</label>
            <select name="housekeeper" value={form.housekeeper} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm">
              <option value="">— Select housekeeper —</option>
              {housekeepers.map((h) => (
                <option key={h.id} value={h.id}>{h.first_name} {h.last_name} (@{h.username})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Initial Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm">
              <option value="dirty">Dirty</option>
              <option value="cleaning">Cleaning</option>
              <option value="clean">Clean</option>
              <option value="inspected">Inspected</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition text-sm font-semibold">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm">
              {submitting ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MaintenanceOverview = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [housekeepers, setHousekeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("maintenance");
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [maintenanceData, housekeepingData, roomData, staffData] = await Promise.all([
          getAllMaintenance(),
          getAllHousekeeping(),
          getAllRooms(),
          getStaffList(),
        ]);
        if (!cancelled) {
          setMaintenance(maintenanceData);
          setHousekeeping(housekeepingData);
          setRooms(roomData);
          setHousekeepers(staffData.filter((s) => s.role === "housekeeper"));
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

  const refresh = async () => {
    setLoading(true);
    try {
      const [m, h] = await Promise.all([getAllMaintenance(), getAllHousekeeping()]);
      setMaintenance(m);
      setHousekeeping(h);
    } catch {
      toast.error("Failed to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceStatus = async (id, status) => {
    try {
      const updated = await updateMaintenanceStatus(id, status);
      setMaintenance((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleHousekeepingStatus = async (id, status) => {
    try {
      const updated = await updateHousekeepingTask(id, { status });
      setHousekeeping((prev) => prev.map((h) => (h.id === id ? updated : h)));
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleAssign = async (payload) => {
    const newTask = await createHousekeepingTask(payload);
    setHousekeeping((prev) => [newTask, ...prev]);
    setShowAssignModal(false);
    toast.success("Task assigned successfully.");
  };

  const openMaintenance = maintenance.filter((m) => m.status !== "resolved").length;
  const pendingHousekeeping = housekeeping.filter((h) => h.status !== "clean" && h.status !== "inspected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance & Housekeeping</h2>
          <p className="text-slate-400 text-sm mt-1">
            Oversee maintenance requests and housekeeping assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
          >
            <Plus size={16} />
            Assign Task
          </button>
          <button onClick={refresh}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open Maintenance", value: openMaintenance, color: "text-red-400" },
          { label: "Resolved", value: maintenance.filter((m) => m.status === "resolved").length, color: "text-green-400" },
          { label: "Pending Cleaning", value: pendingHousekeeping, color: "text-amber-400" },
          { label: "Clean Rooms", value: housekeeping.filter((h) => h.status === "clean" || h.status === "inspected").length, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <p className={`font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "maintenance" ? "bg-amber-400 text-slate-900" : "text-slate-400 hover:text-white"
          }`}
        >
          <Wrench size={15} />
          Maintenance Requests
          {openMaintenance > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "maintenance" ? "bg-slate-900/30 text-slate-900" : "bg-red-400/20 text-red-400"}`}>
              {openMaintenance}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("housekeeping")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "housekeeping" ? "bg-amber-400 text-slate-900" : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckSquare size={15} />
          Housekeeping
          {pendingHousekeeping > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "housekeeping" ? "bg-slate-900/30 text-slate-900" : "bg-amber-400/20 text-amber-400"}`}>
              {pendingHousekeeping}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : activeTab === "maintenance" ? (
        maintenance.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Wrench size={36} className="mx-auto mb-3 opacity-30" />
            <p>No maintenance requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {maintenance.map((req) => (
              <div key={req.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold">Room {req.room_number}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${priorityStyles[req.priority]}`}>
                        {req.priority} priority
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${maintenanceStatusStyles[req.status]}`}>
                        {req.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{req.description}</p>
                    <p className="text-slate-500 text-xs">
                      Reported by: {req.reported_by_username} · {new Date(req.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-slate-400 text-sm shrink-0">Update:</label>
                  <select
                    value={req.status}
                    onChange={(e) => handleMaintenanceStatus(req.id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      ) : housekeeping.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <CheckSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p>No housekeeping tasks assigned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {housekeeping.map((task) => (
            <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold">Room {task.room_number}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${housekeepingStatusStyles[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Assigned to: <span className="text-slate-300">{task.housekeeper_name}</span>
                  </p>
                  {task.notes && (
                    <p className="text-slate-500 text-xs italic">{task.notes}</p>
                  )}
                  <p className="text-slate-500 text-xs">Date: {task.assigned_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-slate-400 text-sm shrink-0">Update:</label>
                <select
                  value={task.status}
                  onChange={(e) => handleHousekeepingStatus(task.id, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
                >
                  <option value="dirty">Dirty</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="clean">Clean</option>
                  <option value="inspected">Inspected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign modal */}
      {showAssignModal && (
        <AssignModal
          rooms={rooms}
          housekeepers={housekeepers}
          onClose={() => setShowAssignModal(false)}
          onSave={handleAssign}
        />
      )}
    </div>
  );
};

export default MaintenanceOverview;