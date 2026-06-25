import { useEffect, useState } from "react";
import {
  getMyTasks,
  updateTaskStatus,
  getMaintenanceRequests,
  updateMaintenanceStatus,
} from "../../api/housekeeping.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  pageTitle,
  pageSubtitle,
  card,
  cardHover,
  select,
  emptyState,
  skeleton,
  badge,
  display,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 8;

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
    <div className={`${cardHover} p-5 space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            Room {task.room_number}
          </h3>
          <p className="text-[#0B1F3A] text-sm font-semibold">
            Assigned: {task.assigned_date}
          </p>
          {task.notes && (
            <p className="text-[#0B1F3A] text-sm font-semibold">
              Notes: <span className="italic">{task.notes}</span>
            </p>
          )}
        </div>
        <span className={`whitespace-nowrap ${badge(task.status)}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-[#0B1F3A] text-sm shrink-0 font-semibold">
          Update status:
        </label>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className={`flex-1 min-w-[140px] ${select} disabled:opacity-50`}
        >
          {taskStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {updating && (
          <span className="text-[#C9A24B] text-sm font-bold shrink-0">
            Updating...
          </span>
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
    <div className={`${cardHover} p-5 space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            Room {request.room_number}
          </h3>
          <p className="text-[#0B1F3A] text-sm font-semibold">{request.description}</p>
          <p className="text-[#0B1F3A] text-sm font-semibold">
            Reported by: {request.reported_by_username}
          </p>
          <p className="text-[#0B1F3A]/70 text-xs font-semibold">
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
          <span className={`whitespace-nowrap ${badge(request.priority)}`}>
            {request.priority} priority
          </span>
          <span className={`whitespace-nowrap ${badge(request.status)}`}>
            {request.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-[#0B1F3A] text-sm shrink-0 font-semibold">
          Update status:
        </label>
        <select
          value={request.status}
          onChange={handleStatusChange}
          disabled={updating}
          className={`flex-1 min-w-[140px] ${select} disabled:opacity-50`}
        >
          {maintenanceStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {updating && (
          <span className="text-[#C9A24B] text-sm font-bold shrink-0">
            Updating...
          </span>
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

  const {
    page: taskPage,
    setPage: setTaskPage,
    totalPages: taskTotalPages,
    paginatedItems: paginatedTasks,
    totalItems: taskTotalItems,
  } = usePagination(tasks, ITEMS_PER_PAGE);

  const {
    page: maintenancePage,
    setPage: setMaintenancePage,
    totalPages: maintenanceTotalPages,
    paginatedItems: paginatedMaintenance,
    totalItems: maintenanceTotalItems,
  } = usePagination(maintenance, ITEMS_PER_PAGE);

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
      <div>
        <h2 className={pageTitle}>My Tasks</h2>
        <p className={pageSubtitle}>
          Manage your cleaning assignments and maintenance requests.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`${card} p-4 space-y-1`}>
          <p className="text-[#0B1F3A] text-sm font-semibold">Cleaning Tasks</p>
          <p className={`${display} text-[#0B1F3A] font-bold text-2xl`}>
            {tasks.length}
          </p>
          {pendingTasks > 0 && (
            <p className="text-[#C9A24B] text-xs font-bold">{pendingTasks} pending</p>
          )}
        </div>
        <div className={`${card} p-4 space-y-1`}>
          <p className="text-[#0B1F3A] text-sm font-semibold">Maintenance</p>
          <p className={`${display} text-[#0B1F3A] font-bold text-2xl`}>
            {maintenance.length}
          </p>
          {pendingMaintenance > 0 && (
            <p className="text-red-700 text-xs font-bold">{pendingMaintenance} unresolved</p>
          )}
        </div>
      </div>

      <div className={`${card} flex gap-1 p-1`}>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 py-2.5 rounded text-sm font-bold transition ${
            activeTab === "tasks"
              ? "bg-[#C9A24B] text-[#0B1F3A]"
              : "text-[#0B1F3A] hover:text-[#C9A24B]"
          }`}
        >
          Cleaning Tasks
          {pendingTasks > 0 && (
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded font-bold ${
                activeTab === "tasks"
                  ? "bg-[#0B1F3A]/20 text-[#0B1F3A]"
                  : "bg-[#C9A24B]/20 text-[#C9A24B]"
              }`}
            >
              {pendingTasks}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex-1 py-2.5 rounded text-sm font-bold transition ${
            activeTab === "maintenance"
              ? "bg-[#C9A24B] text-[#0B1F3A]"
              : "text-[#0B1F3A] hover:text-[#C9A24B]"
          }`}
        >
          Maintenance
          {pendingMaintenance > 0 && (
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded font-bold ${
                activeTab === "maintenance"
                  ? "bg-[#0B1F3A]/20 text-[#0B1F3A]"
                  : "bg-red-100 text-red-900"
              }`}
            >
              {pendingMaintenance}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${skeleton}`} />
          ))}
        </div>
      ) : activeTab === "tasks" ? (
        tasks.length === 0 ? (
          <div className={emptyState}>
            <p>No cleaning tasks assigned.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
              ))}
            </div>
            <Pagination
              page={taskPage}
              totalPages={taskTotalPages}
              onPageChange={setTaskPage}
              totalItems={taskTotalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )
      ) : maintenance.length === 0 ? (
        <div className={emptyState}>
          <p>No maintenance requests.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedMaintenance.map((req) => (
              <MaintenanceCard key={req.id} request={req} onUpdate={handleMaintenanceUpdate} />
            ))}
          </div>
          <Pagination
            page={maintenancePage}
            totalPages={maintenanceTotalPages}
            onPageChange={setMaintenancePage}
            totalItems={maintenanceTotalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  );
};

export default TaskList;
