import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../../api/rooms.api";
import { BedDouble, Users, Filter } from "lucide-react";
import toast from "react-hot-toast";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const statusStyles = {
  available: "bg-green-500/10 text-green-400 border border-green-500/20",
  occupied: "bg-red-500/10 text-red-400 border border-red-500/20",
  cleaning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  maintenance: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const roomTypeLabels = {
  single: "Single",
  double: "Double",
  suite: "Suite",
};

const RoomsBrowse = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (roomType) filters.room_type = roomType;
        if (status) filters.status = status;
        const data = await getRooms(filters);
        setRooms(data);
      } catch {
        toast.error("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [roomType, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
        <p className="text-slate-400 text-sm mt-1">
          Browse and book your perfect room at Fahari Grand.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <Filter size={16} className="text-slate-400" />
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="bg-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {(roomType || status) && (
          <button
            onClick={() => { setRoomType(""); setStatus(""); }}
            className="text-xs text-amber-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Rooms grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 animate-pulse"
            >
              <div className="h-48 bg-slate-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-slate-700 rounded w-3/4" />
                <div className="h-8 bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BedDouble size={40} className="mx-auto mb-3 opacity-40" />
          <p>No rooms found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-amber-400/50 transition-all hover:shadow-lg hover:shadow-amber-400/5 group"
            >
              {/* Room image */}
              <div className="relative h-48 overflow-hidden bg-slate-700">
                {room.image ? (
                  <img
                    src={`${CLOUDINARY_BASE}${room.image}`}
                    alt={`Room ${room.room_number}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BedDouble size={40} className="text-slate-600" />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize backdrop-blur-sm ${statusStyles[room.status] || statusStyles.maintenance}`}
                >
                  {room.status}
                </span>
              </div>

              {/* Room info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold text-base">
                      Room {room.room_number}
                    </h3>
                    <p className="text-slate-400 text-sm capitalize">
                      {roomTypeLabels[room.room_type] || room.room_type} · Floor {room.floor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-lg">
                      KES {parseFloat(room.price_per_night).toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">per night</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Users size={13} />
                  <span>Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}</span>
                </div>

                {room.description && (
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {room.description}
                  </p>
                )}

                <button
                  onClick={() => navigate(`/guest/rooms/${room.id}`)}
                  disabled={room.status !== "available"}
                  className="w-full py-2 rounded-lg text-sm font-semibold transition
                    bg-amber-400 text-slate-900 hover:bg-amber-300
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-400"
                >
                  {room.status === "available" ? "Book Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsBrowse;