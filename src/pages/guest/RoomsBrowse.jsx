import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRooms } from "../../api/rooms.api";
import toast from "react-hot-toast";
import Pagination from "../../components/shared/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProfileButton from "../../components/shared/ProfileButton";
import {
  display, pageTitle, pageSubtitle, filterBar, select, input,
  cardHover, btnNavy, btnGhost, emptyState, skeleton, badge,
} from "../../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const roomTypeLabels = {
  single: "Single",
  double: "Double",
  suite: "Suite",
};

const ITEMS_PER_PAGE = 9;
const today = new Date().toISOString().split("T")[0];

const RoomsBrowse = () => {
  usePageTitle("Browse Rooms");
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState("");
  const [status, setStatus] = useState("");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const navigate = useNavigate();

  const { page, setPage, totalPages, paginatedItems, totalItems } =
    usePagination(rooms, ITEMS_PER_PAGE);

  const hasDateSearch = Boolean(checkIn && checkOut);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (roomType) filters.room_type = roomType;
        if (status) filters.status = status;
        if (checkIn && checkOut) {
          filters.check_in = checkIn;
          filters.check_out = checkOut;
        }
        const data = await getRooms(filters);
        setRooms(data);
      } catch {
        toast.error("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Keep the URL shareable/refreshable with the current date search
    const params = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomType, status, checkIn, checkOut]);

  const clearDates = () => {
    setCheckIn("");
    setCheckOut("");
  };

  const goToRoom = (roomId) => {
    if (hasDateSearch) {
      navigate(`/guest/rooms/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}`);
    } else {
      navigate(`/guest/rooms/${roomId}`);
    }
  };

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

        <div className="flex items-center gap-2">
          <label className="text-[#0B1F3A] text-xs font-bold">Check-in</label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) setCheckOut("");
            }}
            className={`${input} !w-auto`}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#0B1F3A] text-xs font-bold">Check-out</label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`${input} !w-auto`}
          />
        </div>

        <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={select}>
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>

        {!hasDateSearch && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={select}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        )}

        {(roomType || status || hasDateSearch) && (
          <button
            onClick={() => { setRoomType(""); setStatus(""); clearDates(); }}
            className="text-xs text-[#C9A24B] font-bold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasDateSearch && (
        <div className="bg-[#C9A24B]/10 border border-[#C9A24B]/30 rounded px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[#0B1F3A] text-sm font-semibold">
            Showing rooms available <span className="font-bold">{checkIn}</span> → <span className="font-bold">{checkOut}</span>
          </p>
          <button onClick={clearDates} className={`text-xs ${btnGhost}`}>
            Clear dates
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-72 ${skeleton}`} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className={emptyState}>
          <p>
            {hasDateSearch
              ? "No rooms are available for the dates you selected."
              : "No rooms found matching your filters."}
          </p>
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
                  <span className={`absolute top-3 right-3 ${
                    hasDateSearch
                      ? "text-xs font-bold px-2.5 py-0.5 rounded capitalize bg-emerald-100 text-emerald-900 border border-emerald-400"
                      : badge(room.status)
                  }`}>
                    {hasDateSearch ? "available for your dates" : room.status}
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
                    onClick={() => goToRoom(room.id)}
                    disabled={!hasDateSearch && room.status !== "available"}
                    className={`w-full py-2 rounded text-sm ${btnNavy} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {hasDateSearch
                      ? "Book Now"
                      : room.status === "available"
                      ? "Book Now"
                      : "Unavailable"}
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