import { useEffect, useState } from "react";
import {
  getAllRooms, createRoom, updateRoom, deleteRoom,
} from "../../api/admin.api";
import {
  BedDouble, Plus, Pencil, Trash2, X, Upload, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const statusStyles = {
  available: "bg-green-500/10 text-green-400 border border-green-500/20",
  occupied: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  cleaning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  maintenance: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const EMPTY_FORM = {
  room_number: "",
  room_type: "single",
  floor: "",
  capacity: "",
  price_per_night: "",
  status: "available",
  description: "",
  image: null,
};

const RoomModal = ({ room, onClose, onSave }) => {
  const [form, setForm] = useState(
    room
      ? {
          room_number: room.room_number,
          room_type: room.room_type,
          floor: room.floor,
          capacity: room.capacity,
          price_per_night: room.price_per_night,
          status: room.status,
          description: room.description || "",
          image: null,
        }
      : EMPTY_FORM
  );
  const [preview, setPreview] = useState(
    room?.image ? `${CLOUDINARY_BASE}${room.image}` : null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.room_number || !form.floor || !form.capacity || !form.price_per_night) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "image" && !val) return;
        fd.append(key, val);
      });
      await onSave(fd);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save room.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold text-lg">
            {room ? "Edit Room" : "Add New Room"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Room Image</label>
            <div
              onClick={() => document.getElementById("room-image-input").click()}
              className="relative h-40 rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-400 transition cursor-pointer overflow-hidden bg-slate-800"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
                  <Upload size={24} />
                  <p className="text-sm">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              id="room-image-input"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Room number + type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Room Number *</label>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                placeholder="e.g. 101"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Room Type *</label>
              <select
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>
          </div>

          {/* Floor + capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Floor *</label>
              <input
                name="floor"
                type="number"
                value={form.floor}
                onChange={handleChange}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Capacity *</label>
              <input
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Price + status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Price per Night (KES) *</label>
              <input
                name="price_per_night"
                type="number"
                value={form.price_per_night}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the room..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm"
            >
              {submitting ? "Saving..." : room ? "Save Changes" : "Add Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirm = ({ room, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-red-500/30 w-full max-w-sm p-6 space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Delete Room {room.room_number}?</h3>
          <p className="text-slate-400 text-sm mt-1">
            This action cannot be undone. All data for this room will be permanently removed.
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
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteRoom_, setDeleteRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllRooms();
        if (!cancelled) setRooms(data);
      } catch {
        if (!cancelled) toast.error("Failed to load rooms.");
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
      const data = await getAllRooms();
      setRooms(data);
    } catch {
      toast.error("Failed to refresh rooms.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (fd) => {
    const newRoom = await createRoom(fd);
    setRooms((prev) => [...prev, newRoom]);
    setShowModal(false);
    toast.success(`Room ${newRoom.room_number} created.`);
  };

  const handleUpdate = async (fd) => {
    const updated = await updateRoom(editRoom.id, fd);
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditRoom(null);
    toast.success(`Room ${updated.room_number} updated.`);
  };

  const handleDelete = async () => {
    await deleteRoom(deleteRoom_.id);
    setRooms((prev) => prev.filter((r) => r.id !== deleteRoom_.id));
    toast.success(`Room ${deleteRoom_.room_number} deleted.`);
    setDeleteRoom(null);
  };

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.room_number.includes(search) ||
      r.room_type.includes(search.toLowerCase());
    const matchType = filterType ? r.room_type === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Room Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Add, edit, and manage all hotel rooms.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-400 focus:outline-none w-56"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>
        <button
          onClick={refresh}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={15} />
        </button>
        <span className="text-slate-500 text-sm ml-auto">
          {filtered.length} room{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rooms grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BedDouble size={40} className="mx-auto mb-3 opacity-30" />
          <p>No rooms found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((room) => (
            <div
              key={room.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition group"
            >
              {/* Image */}
              <div className="relative h-44 bg-slate-700 overflow-hidden">
                {room.image ? (
                  <img
                    src={`${CLOUDINARY_BASE}${room.image}`}
                    alt={`Room ${room.room_number}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BedDouble size={36} className="text-slate-600" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize backdrop-blur-sm ${statusStyles[room.status] || statusStyles.maintenance}`}>
                  {room.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold">Room {room.room_number}</h3>
                    <p className="text-slate-400 text-xs capitalize">
                      {room.room_type} · Floor {room.floor} · {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-amber-400 font-bold text-sm">
                    KES {parseFloat(room.price_per_night).toLocaleString()}
                    <span className="text-slate-500 font-normal text-xs">/night</span>
                  </p>
                </div>

                {room.description && (
                  <p className="text-slate-500 text-xs line-clamp-2">{room.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition text-sm"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-sm"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <RoomModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
      {editRoom && (
        <RoomModal room={editRoom} onClose={() => setEditRoom(null)} onSave={handleUpdate} />
      )}
      {deleteRoom_ && (
        <DeleteConfirm
          room={deleteRoom_}
          onClose={() => setDeleteRoom(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default RoomManagement;