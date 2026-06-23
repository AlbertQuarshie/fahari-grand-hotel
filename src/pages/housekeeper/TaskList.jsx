import { useEffect, useState } from "react";
import {
  getMyTasks,
  updateTaskStatus,
  getMaintenanceRequests,
  updateMaintenanceStatus,
} from "../../api/housekeeping.api";
import { CheckSquare, Wrench, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const taskStatusStyles = {
  dirty: "bg-red-500/10 text-red-400 border border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  clean: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const maintenanceStatusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  resolved: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const priorityStyles = {
  low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const taskStatusOptions = [
  { value: "dirty", label: "Dirty" },
  { value: "in_progress", label: "In Progress" },
  { value: "clean", label: "Clean" },
];

const maintenanceStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const TaskCard = ({ task, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;
    setUpdating(true);
    try {
      await onUpdate(task.id, newStatus);
      toast.success(`Room ${task.room_number} marked as ${newStatus.replace("_", " ")}.`);
    } catch {
      toast.error("Failed to update task status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 hover:border-slate-600 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-lg">Room {task.room_number}</h3>
          <p className="text-slate-400 text-sm">
            Assigned: <span className="text-slate-300">{task.assigned_date}</span>
          </p>
          {task.notes && (
            <p className="text-slate-400 text-sm">
              Notes: <span className="text-slate-300 italic">{task.notes}</span>
            </p>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${taskStatusStyles[task.status] || taskStatusStyles.dirty}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-slate-400 text-sm shrink-0">Update status:</label>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm disabled:opacity-50"
        >
          {taskStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {updating && (
          <RefreshCw size={15} className="text-amber-400 animate-spin shrink-0" />
        )}
      </div>
    </div>
  );
};

const MaintenanceCard = ({ request, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === request.status) return;
    setUpdating(true);
    try {
      await onUpdate(request.id, newStatus);
      toast.success(`Maintenance request updated to ${newStatus.replace("_", " ")}.`);
    } catch {
      toast.error("Failed to update maintenance status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 hover:border-slate-600 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-lg">Room {request.room_number}</h3>
          <p className="text-slate-300 text-sm">{request.description}</p>
          <p className="text-slate-400 text-sm">
            Reported by:{" "}
            <span className="text-slate-300">{request.reported_by_username}</span>
          </p>
          <p className="text-slate-500 text-xs">
            {new Date(request.created_at).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${priorityStyles[request.priority] || priorityStyles.medium}`}>
            {request.priority} priority
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${maintenanceStatusStyles[request.status] || maintenanceStatusStyles.pending}`}>
            {request.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-slate-400 text-sm shrink-0">Update status:</label>
        <select
          value={request.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm disabled:opacity-50"
        >
          {maintenanceStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {updating && (
          <RefreshCw size={15} className="text-amber-400 animate-spin shrink-0" />
        )}
      </div>
    </div>
  );
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [taskData, maintenanceData] = await Promise.all([
          getMyTasks(),
          getMaintenanceRequests(),
        ]);
        if (!cancelled) {
          setTasks(taskData);
          setMaintenance(maintenanceData);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load tasks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleTaskUpdate = async (id, status) => {
    await updateTaskStatus(id, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleMaintenanceUpdate = async (id, status) => {
    await updateMaintenanceStatus(id, status);
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const pendingTasks = tasks.filter((t) => t.status !== "clean").length;
  const pendingMaintenance = maintenance.filter((m) => m.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">My Tasks</h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage your cleaning assignments and maintenance requests.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-1">
          <p className="text-slate-400 text-sm">Cleaning Tasks</p>
          <p className="text-white font-bold text-2xl">{tasks.length}</p>
          {pendingTasks > 0 && (
            <p className="text-amber-400 text-xs">{pendingTasks} pending</p>
          )}
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-1">
          <p className="text-slate-400 text-sm">Maintenance</p>
          <p className="text-white font-bold text-2xl">{maintenance.length}</p>
          {pendingMaintenance > 0 && (
            <p className="text-red-400 text-xs">{pendingMaintenance} unresolved</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "tasks"
              ? "bg-amber-400 text-slate-900"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckSquare size={15} />
          Cleaning Tasks
          {pendingTasks > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "tasks" ? "bg-slate-900/30 text-slate-900" : "bg-amber-400/20 text-amber-400"}`}>
              {pendingTasks}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "maintenance"
              ? "bg-amber-400 text-slate-900"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Wrench size={15} />
          Maintenance
          {pendingMaintenance > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "maintenance" ? "bg-slate-900/30 text-slate-900" : "bg-red-400/20 text-red-400"}`}>
              {pendingMaintenance}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : activeTab === "tasks" ? (
        tasks.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <CheckSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p>No cleaning tasks assigned.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
          </div>
        )
      ) : maintenance.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <AlertTriangle size={36} className="mx-auto mb-3 opacity-30" />
          <p>No maintenance requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenance.map((req) => (
            <MaintenanceCard key={req.id} request={req} onUpdate={handleMaintenanceUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;