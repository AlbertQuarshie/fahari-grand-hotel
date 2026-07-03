import { useEffect, useState } from "react";
import { getStaffList, registerStaff, updateUser, deleteUser } from "../../api/staff.api";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, pageTitle, pageSubtitle, filterBar, card,
  btnPrimary, btnOutline, btnDanger, input, select,
  emptyState, skeleton, badge,
} from "../../constants/theme";

const ITEMS_PER_PAGE = 10;
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
    <div className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#0B1F3A]/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0B1F3A]/10">
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </h3>
          <button onClick={onClose} className="text-[#0B1F3A]/50 hover:text-[#0B1F3A] transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">First Name *</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className={input} />
            </div>
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Last Name *</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={input} />
            </div>
          </div>

          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Username *</label>
            <input name="username" value={form.username} onChange={handleChange} className={input} />
          </div>

          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className={input} />
          </div>

          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className={input}
            />
          </div>

          <div>
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className={`w-full ${select}`}>
              {roleOptions.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {!staff && (
            <>
              <div>
                <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className={input} />
              </div>
              <div>
                <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Confirm Password *</label>
                <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} className={input} />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className={`flex-1 py-2.5 rounded text-sm ${btnOutline}`}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex-1 py-2.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}
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
    <div className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded border border-red-200 w-full max-w-sm p-6 space-y-5 text-center">
        <div>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            Remove {staff.first_name}?
          </h3>
          <p className="text-[#0B1F3A]/70 text-sm mt-1 font-semibold">
            This will permanently remove <span className="text-[#0B1F3A] font-bold">@{staff.username}</span> from the system.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded text-sm ${btnOutline}`}>
            Cancel
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              setDeleting(false);
            }}
            disabled={deleting}
            className={`flex-1 py-2.5 rounded text-sm ${btnDanger} disabled:opacity-50`}
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  usePageTitle("Staff Management");
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

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  const counts = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Staff Management</h2>
          <p className={pageSubtitle}>
            Manage all hotel staff accounts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`px-4 py-2.5 rounded text-sm ${btnPrimary}`}
        >
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: staff.length, color: "text-[#0B1F3A]" },
          { label: "Receptionists", value: counts.receptionist || 0, color: "text-blue-700" },
          { label: "Housekeepers", value: counts.housekeeper || 0, color: "text-emerald-700" },
          { label: "Admins", value: counts.admin || 0, color: "text-[#C9A24B]" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4 space-y-1`}>
            <p className="text-[#0B1F3A]/60 text-xs font-semibold">{label}</p>
            <p className={`${display} font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className={filterBar}>
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${input} w-52`}
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className={select}>
          <option value="">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="housekeeper">Housekeeper</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={refresh} className={`px-4 py-2 rounded text-sm ${btnOutline}`}>
          Refresh
        </button>
        <span className="text-[#0B1F3A]/60 text-sm font-semibold ml-auto">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-16 ${skeleton}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={emptyState}>
          <p>No staff members found.</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-[#0B1F3A]/10 text-[#0B1F3A]/60 text-xs font-bold uppercase tracking-wide">
            <span className="col-span-2">Name</span>
            <span>Role</span>
            <span>Phone</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#0B1F3A]/10">
            {paginatedItems.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-[#FAF8F3] transition"
              >
                <div className="sm:col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center text-[#C9A24B] font-bold text-sm shrink-0">
                    {member.first_name[0]}{member.last_name[0]}
                  </div>
                  <div>
                    <p className="text-[#0B1F3A] font-bold text-sm">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-[#0B1F3A]/50 text-xs font-semibold">@{member.username}</p>
                    <p className="text-[#0B1F3A]/50 text-xs font-semibold">{member.email}</p>
                  </div>
                </div>

                <div>
                  <span className={badge(member.role)}>
                    {member.role}
                  </span>
                </div>

                <p className="text-[#0B1F3A]/70 text-sm font-semibold">{member.phone || "—"}</p>

                <div className="flex gap-2 sm:justify-end">
                  <button
                    onClick={() => setEditStaff(member)}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${btnOutline}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteStaff(member)}
                    className="px-3 py-1.5 rounded text-xs font-bold text-red-700 border-2 border-red-200 hover:border-red-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </div>
      )}

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
