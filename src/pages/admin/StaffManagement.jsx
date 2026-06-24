import { useEffect, useState } from "react";
import { getStaffList, registerStaff, updateUser, deleteUser } from "../../api/staff.api";
import { Users, Plus, Pencil, Trash2, X, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const roleStyles = {
  admin: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  receptionist: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  housekeeper: "bg-green-500/10 text-green-400 border border-green-500/20",
  guest: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const roleOptions = ["receptionist", "housekeeper", "admin"];

const EMPTY_FORM = {
  username: "", email: "", password: "", confirm_password: "",
  first_name: "", last_name: "", phone: "", role: "receptionist",
};

const StaffModal = ({ staff, onClose, onSave }) => {
  const [form, setForm] = useState(
    staff
      ? {
          username: staff.username,
          email: staff.email,
          first_name: staff.first_name,
          last_name: staff.last_name,
          phone: staff.phone || "",
          role: staff.role,
        }
      : EMPTY_FORM
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.first_name || !form.last_name) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!staff && form.password !== form.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!staff && form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      const errors = err.response?.data;
      const message = errors?.detail ||
        errors?.username?.[0] ||
        errors?.email?.[0] ||
        "Failed to save staff member.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold text-lg">
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">First Name *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Last Name *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Username *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Password — only for new staff */}
          {!staff && (
            <>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Password *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Confirm Password *</label>
                <input
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm"
            >
              {submitting ? "Saving..." : staff ? "Save Changes" : "Add Staff"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirm = ({ staff, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-red-500/30 w-full max-w-sm p-6 space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Remove {staff.first_name}?</h3>
          <p className="text-slate-400 text-sm mt-1">
            This will permanently remove <span className="text-white">@{staff.username}</span> from the system.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              setDeleting(false);
            }}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-400 transition disabled:opacity-50 text-sm"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [deleteStaff_, setDeleteStaff] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getStaffList();
        if (!cancelled) setStaff(data);
      } catch {
        if (!cancelled) toast.error("Failed to load staff.");
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
      const data = await getStaffList();
      setStaff(data);
    } catch {
      toast.error("Failed to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    const newStaff = await registerStaff(form);
    setStaff((prev) => [...prev, newStaff]);
    setShowModal(false);
    toast.success(`${newStaff.first_name} added successfully.`);
  };

  const handleUpdate = async (form) => {
    const updated = await updateUser(editStaff.id, form);
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditStaff(null);
    toast.success(`${updated.first_name} updated successfully.`);
  };

  const handleDelete = async () => {
    await deleteUser(deleteStaff_.id);
    setStaff((prev) => prev.filter((s) => s.id !== deleteStaff_.id));
    toast.success(`${deleteStaff_.first_name} removed.`);
    setDeleteStaff(null);
  };

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.username.toLowerCase().includes(q) ||
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    const matchRole = filterRole ? s.role === filterRole : true;
    return matchSearch && matchRole;
  });

  // Summary counts
  const counts = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage all hotel staff accounts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: staff.length, color: "text-white" },
          { label: "Receptionists", value: counts.receptionist || 0, color: "text-blue-400" },
          { label: "Housekeepers", value: counts.housekeeper || 0, color: "text-green-400" },
          { label: "Admins", value: counts.admin || 0, color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-1">
            <p className="text-slate-400 text-xs">{label}</p>
            <p className={`font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 focus:border-amber-400 focus:outline-none w-52"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="housekeeper">Housekeeper</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={refresh}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={15} />
        </button>
        <span className="text-slate-500 text-sm ml-auto">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Staff table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p>No staff members found.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-slate-700 text-slate-500 text-xs font-semibold uppercase tracking-wide">
            <span className="col-span-2">Name</span>
            <span>Role</span>
            <span>Phone</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-700/50">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-slate-700/30 transition"
              >
                {/* Name + username */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                    {member.first_name[0]}{member.last_name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-slate-500 text-xs">@{member.username}</p>
                    <p className="text-slate-500 text-xs">{member.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleStyles[member.role] || roleStyles.guest}`}>
                    {member.role}
                  </span>
                </div>

                {/* Phone */}
                <p className="text-slate-400 text-sm">{member.phone || "—"}</p>

                {/* Actions */}
                <div className="flex gap-2 sm:justify-end">
                  <button
                    onClick={() => setEditStaff(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition text-xs font-semibold"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteStaff(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-xs font-semibold"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <StaffModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
      {editStaff && (
        <StaffModal staff={editStaff} onClose={() => setEditStaff(null)} onSave={handleUpdate} />
      )}
      {deleteStaff_ && (
        <DeleteConfirm
          staff={deleteStaff_}
          onClose={() => setDeleteStaff(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StaffManagement;