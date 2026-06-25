import { useEffect, useState } from "react";
import {
  getAllMaintenance, updateMaintenanceStatus,
  getAllHousekeeping, createHousekeepingTask, updateHousekeepingTask,
  getAllRooms,
} from "../../api/admin.api";
import { getStaffList } from "../../api/staff.api";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  display, pageTitle, pageSubtitle, card,
  btnPrimary, btnOutline, input, select,
  emptyState, skeleton, badge,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 8;

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
    <div className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#0B1F3A]/10 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0B1F3A]/10">
          <h3 className={`${display} text-[#0B1F3A] font-bold`}>Assign Housekeeping Task</h3>
          <button onClick={onClose} className="text-[#0B1F3A]/50 hover:text-[#0B1F3A]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Room *</label>
            <select name="room" value={form.room} onChange={handleChange} className={`w-full ${select}`}>
              <option value="">— Select room —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Housekeeper *</label>
            <select name="housekeeper" value={form.housekeeper} onChange={handleChange} className={`w-full ${select}`}>
              <option value="">— Select housekeeper —</option>
              {housekeepers.map((h) => (
                <option key={h.id} value={h.id}>{h.first_name} {h.last_name} (@{h.username})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Initial Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={`w-full ${select}`}>
              <option value="dirty">Dirty</option>
              <option value="cleaning">Cleaning</option>
              <option value="clean">Clean</option>
              <option value="inspected">Inspected</option>
            </select>
          </div>
          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Any special instructions..."
              className={`${input} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className={`flex-1 py-2.5 rounded text-sm ${btnOutline}`}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className={`flex-1 py-2.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}>
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

  const maintenancePagination = usePagination(maintenance, ITEMS_PER_PAGE);
  const housekeepingPagination = usePagination(housekeeping, ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Maintenance & Housekeeping</h2>
          <p className={pageSubtitle}>
            Oversee maintenance requests and housekeeping assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className={`px-4 py-2.5 rounded text-sm ${btnPrimary}`}
          >
            Assign Task
          </button>
          <button onClick={refresh} className={`px-4 py-2 rounded text-sm ${btnOutline}`}>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open Maintenance", value: openMaintenance, color: "text-red-700" },
          { label: "Resolved", value: maintenance.filter((m) => m.status === "resolved").length, color: "text-emerald-700" },
          { label: "Pending Cleaning", value: pendingHousekeeping, color: "text-[#C9A24B]" },
          { label: "Clean Rooms", value: housekeeping.filter((h) => h.status === "clean" || h.status === "inspected").length, color: "text-emerald-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4 text-center`}>
            <p className={`${display} font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-[#0B1F3A]/60 text-xs mt-1 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-white rounded border border-[#0B1F3A]/10 p-1">
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition ${
            activeTab === "maintenance" ? btnPrimary : "text-[#0B1F3A]/60 hover:text-[#0B1F3A]"
          }`}
        >
          Maintenance Requests
          {openMaintenance > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "maintenance" ? "bg-[#0B1F3A]/10 text-[#0B1F3A]" : "bg-red-100 text-red-700"
            }`}>
              {openMaintenance}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("housekeeping")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition ${
            activeTab === "housekeeping" ? btnPrimary : "text-[#0B1F3A]/60 hover:text-[#0B1F3A]"
          }`}
        >
          Housekeeping
          {pendingHousekeeping > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "housekeeping" ? "bg-[#0B1F3A]/10 text-[#0B1F3A]" : "bg-amber-100 text-amber-900"
            }`}>
              {pendingHousekeeping}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-24 ${skeleton}`} />
          ))}
        </div>
      ) : activeTab === "maintenance" ? (
        maintenance.length === 0 ? (
          <div className={emptyState}>
            <p>No maintenance requests.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {maintenancePagination.paginatedItems.map((req) => (
                <div key={req.id} className={`${card} p-5 space-y-3`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`${display} text-[#0B1F3A] font-bold`}>Room {req.room_number}</p>
                        <span className={badge(req.priority)}>
                          {req.priority} priority
                        </span>
                        <span className={badge(req.status)}>
                          {req.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[#0B1F3A]/80 text-sm font-semibold">{req.description}</p>
                      <p className="text-[#0B1F3A]/50 text-xs font-semibold">
                        Reported by: {req.reported_by_username} · {new Date(req.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[#0B1F3A]/70 text-sm font-semibold shrink-0">Update:</label>
                    <select
                      value={req.status}
                      onChange={(e) => handleMaintenanceStatus(req.id, e.target.value)}
                      className={`flex-1 ${select}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={maintenancePagination.page}
              totalPages={maintenancePagination.totalPages}
              onPageChange={maintenancePagination.setPage}
              totalItems={maintenancePagination.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )
      ) : housekeeping.length === 0 ? (
        <div className={emptyState}>
          <p>No housekeeping tasks assigned.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {housekeepingPagination.paginatedItems.map((task) => (
              <div key={task.id} className={`${card} p-5 space-y-3`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`${display} text-[#0B1F3A] font-bold`}>Room {task.room_number}</p>
                      <span className={badge(task.status === "cleaning" ? "cleaning" : task.status)}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[#0B1F3A]/70 text-sm font-semibold">
                      Assigned to: <span className="text-[#0B1F3A]">{task.housekeeper_name}</span>
                    </p>
                    {task.notes && (
                      <p className="text-[#0B1F3A]/50 text-xs italic font-semibold">{task.notes}</p>
                    )}
                    <p className="text-[#0B1F3A]/50 text-xs font-semibold">Date: {task.assigned_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[#0B1F3A]/70 text-sm font-semibold shrink-0">Update:</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleHousekeepingStatus(task.id, e.target.value)}
                    className={`flex-1 ${select}`}
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
          <Pagination
            page={housekeepingPagination.page}
            totalPages={housekeepingPagination.totalPages}
            onPageChange={housekeepingPagination.setPage}
            totalItems={housekeepingPagination.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}

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
