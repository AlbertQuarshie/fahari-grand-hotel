import { useEffect, useState } from "react";
import {
  getAllRooms, createRoom, updateRoom, deleteRoom,
  uploadRoomImage, deleteRoomImage,
} from "../../api/admin.api";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, pageTitle, pageSubtitle, filterBar, cardHover,
  btnPrimary, btnOutline, btnDanger, input, select,
  emptyState, skeleton, badge,
} from "../../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";
const ITEMS_PER_PAGE = 9;

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
  const [gallery, setGallery] = useState(room?.images || []);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const handleAddGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (!room) {
      toast.error("Save the room first, then reopen it to add more photos.");
      return;
    }
    setGalleryUploading(true);
    try {
      for (const file of files) {
        const img = await uploadRoomImage(room.id, file);
        setGallery((prev) => [...prev, img]);
      }
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} added.`);
    } catch {
      toast.error("Failed to upload one or more photos.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (imgId) => {
    try {
      await deleteRoomImage(imgId);
      setGallery((prev) => prev.filter((img) => img.id !== imgId));
    } catch {
      toast.error("Failed to remove photo.");
    }
  };

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
    <div className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#0B1F3A]/10 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0B1F3A]/10 sticky top-0 z-10 bg-white">
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            {room ? "Edit Room" : "Add New Room"}
          </h3>
          <button onClick={onClose} className="text-[#0B1F3A]/50 hover:text-[#0B1F3A] transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-2">Room Image</label>
              <div
                onClick={() => document.getElementById("room-image-input").click()}
                className="relative h-40 rounded border-2 border-dashed border-[#0B1F3A]/20 hover:border-[#C9A24B] transition cursor-pointer overflow-hidden bg-[#FAF8F3]"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#0B1F3A]/50">
                    <p className="text-sm font-semibold">Click to upload image</p>
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

            <div className="space-y-4">
              <div>
                <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Room Number *</label>
                <input
                  name="room_number"
                  value={form.room_number}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                  className={input}
                />
              </div>
              <div>
                <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Room Type *</label>
                <select name="room_type" value={form.room_type} onChange={handleChange} className={`w-full ${select}`}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Floor *</label>
              <input
                name="floor"
                type="number"
                value={form.floor}
                onChange={handleChange}
                placeholder="e.g. 1"
                className={input}
              />
            </div>
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Capacity *</label>
              <input
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                placeholder="e.g. 2"
                className={input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Price per Night (KES) *</label>
              <input
                name="price_per_night"
                type="number"
                value={form.price_per_night}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className={input}
              />
            </div>
            <div>
              <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={`w-full ${select}`}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the room..."
              className={`${input} resize-none`}
            />
          </div>

          <div className="col-span-2 border-t border-[#0B1F3A]/10 pt-4">
            <label className="block text-[#0B1F3A] text-sm font-semibold mb-2">
              Additional Photos <span className="font-normal text-[#0B1F3A]/50">(bedroom, bathroom, living area, etc.)</span>
            </label>

            {!room && (
              <p className="text-xs font-semibold text-[#0B1F3A]/50 bg-[#FAF8F3] border border-[#0B1F3A]/10 rounded px-3 py-2 mb-3">
                Save this room first, then reopen it to add more photos.
              </p>
            )}

            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div key={img.id} className="relative h-20 rounded overflow-hidden border border-[#0B1F3A]/10 group">
                  <img
                    src={`${CLOUDINARY_BASE}${img.image}`}
                    alt={img.caption || "Room photo"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryImage(img.id)}
                    className="absolute top-1 right-1 bg-white/90 rounded p-1 text-red-700 opacity-0 group-hover:opacity-100 transition"
                    title="Remove photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {room && (
                <div
                  onClick={() => !galleryUploading && document.getElementById("room-gallery-input").click()}
                  className="h-20 rounded border-2 border-dashed border-[#0B1F3A]/20 hover:border-[#C9A24B] transition cursor-pointer flex flex-col items-center justify-center gap-1 text-[#0B1F3A]/50 bg-[#FAF8F3]"
                >
                  <Plus size={16} />
                  <span className="text-[10px] font-semibold">{galleryUploading ? "Uploading..." : "Add"}</span>
                </div>
              )}
            </div>

            <input
              id="room-gallery-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddGalleryFiles}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className={`flex-1 py-2.5 rounded text-sm ${btnOutline}`}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex-1 py-2.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}
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
    <div className="fixed inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded border border-red-200 w-full max-w-sm p-6 space-y-5 text-center">
        <div>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            Delete Room {room.room_number}?
          </h3>
          <p className="text-[#0B1F3A]/70 text-sm mt-1 font-semibold">
            This action cannot be undone. All data for this room will be permanently removed.
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
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomManagement = () => {
  usePageTitle("Room Management");
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
    toast.success(`Room ${newRoom.room_number} created. Reopen it to add more photos.`);
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

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Room Management</h2>
          <p className={pageSubtitle}>
            Add, edit, and manage all hotel rooms.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`px-4 py-2.5 rounded text-sm ${btnPrimary}`}
        >
          Add Room
        </button>
      </div>

      <div className={filterBar}>
        <input
          type="text"
          placeholder="Search by room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${input} w-56`}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={select}>
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>
        <button onClick={refresh} className={`px-4 py-2 rounded text-sm ${btnOutline}`}>
          Refresh
        </button>
        <span className="text-[#0B1F3A]/60 text-sm font-semibold ml-auto">
          {filtered.length} room{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-64 ${skeleton}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={emptyState}>
          <p>No rooms found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedItems.map((room) => (
              <div key={room.id} className={`${cardHover} overflow-hidden group`}>
                <div className="relative h-44 bg-[#0B1F3A]/5 overflow-hidden">
                  {room.image ? (
                    <img
                      src={`${CLOUDINARY_BASE}${room.image}`}
                      alt={`Room ${room.room_number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`${display} text-[#0B1F3A]/40 font-bold text-lg`}>
                        Room {room.room_number}
                      </span>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 ${badge(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${display} text-[#0B1F3A] font-bold`}>
                        Room {room.room_number}
                      </h3>
                      <p className="text-[#0B1F3A]/60 text-xs capitalize font-semibold">
                        {room.room_type} · Floor {room.floor} · {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-[#C9A24B] font-bold text-sm">
                      KES {parseFloat(room.price_per_night).toLocaleString()}
                      <span className="text-[#0B1F3A]/50 font-normal text-xs">/night</span>
                    </p>
                  </div>

                  {room.description && (
                    <p className="text-[#0B1F3A]/50 text-xs line-clamp-2 font-semibold">{room.description}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setEditRoom(room)}
                      className={`flex-1 py-2 rounded text-sm ${btnOutline}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteRoom(room)}
                      className="flex-1 py-2 rounded text-sm text-red-700 font-bold border-2 border-red-200 hover:border-red-400 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}

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