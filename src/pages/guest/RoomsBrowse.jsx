import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../../api/rooms.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import ProfileButton from "../../components/shared/ProfileButton";
import {
  display, pageTitle, pageSubtitle, filterBar, select,
  cardHover, btnNavy, emptyState, skeleton, badge,
} from "../../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const roomTypeLabels = {
  single: "Single",
  double: "Double",
  suite: "Suite",
};

const ITEMS_PER_PAGE = 9;

const RoomsBrowse = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(rooms, ITEMS_PER_PAGE);

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
      {/* Header row with profile button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className={pageTitle}>Available Rooms</h2>
          <p className={pageSubtitle}>
            Browse and book your perfect room at Fahari Grand.
          </p>
        </div>
        <div className="shrink-0">
          <ProfileButton />
        </div>
      </div>

      <div className={filterBar}>
        <span className="text-[#0B1F3A] text-sm font-bold">Filters</span>
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={select}>
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={select}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {(roomType || status) && (
          <button
            onClick={() => { setRoomType(""); setStatus(""); }}
            className="text-xs text-[#C9A24B] font-bold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-72 ${skeleton}`} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className={emptyState}>
          <p>No rooms found matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((room) => (
              <div key={room.id} className={`${cardHover} overflow-hidden group`}>
                <div className="relative h-48 overflow-hidden bg-[#0B1F3A]/5">
                  {room.image ? (
                    <img
                      src={`${CLOUDINARY_BASE}${room.image}`}
                      alt={`Room ${room.room_number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0B1F3A]/10">
                      <span className={`${display} text-[#0B1F3A]/40 font-bold text-lg`}>
                        Room {room.room_number}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
                  <span className={`${display} absolute bottom-3 left-3 text-white font-bold text-lg`}>
                    Room {room.room_number}
                  </span>
                  <span className={`absolute top-3 right-3 ${badge(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#0B1F3A] text-sm font-semibold capitalize">
                        {roomTypeLabels[room.room_type] || room.room_type} · Floor {room.floor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`${display} text-[#0B1F3A] font-bold`}>
                        KES {parseFloat(room.price_per_night).toLocaleString()}
                      </p>
                      <p className="text-[#0B1F3A] text-xs font-semibold">per night</p>
                    </div>
                  </div>

                  <p className="text-[#0B1F3A] text-xs font-semibold">
                    Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                  </p>

                  {room.description && (
                    <p className="text-[#0B1F3A] text-xs line-clamp-2">{room.description}</p>
                  )}

                  <button
                    onClick={() => navigate(`/guest/rooms/${room.id}`)}
                    disabled={room.status !== "available"}
                    className={`w-full py-2 rounded text-sm ${btnNavy} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {room.status === "available" ? "Book Now" : "Unavailable"}
                  </button>
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
    </div>
  );
};

export default RoomsBrowse;