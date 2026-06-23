import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom } from "../../api/rooms.api";
import { createBooking } from "../../api/bookings.api";
import { BedDouble, Users, ArrowLeft, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const roomTypeLabels = { single: "Single", double: "Double", suite: "Suite" };

const statusStyles = {
  available: "bg-green-500/10 text-green-400 border border-green-500/20",
  occupied: "bg-red-500/10 text-red-400 border border-red-500/20",
  cleaning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  maintenance: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const today = new Date().toISOString().split("T")[0];

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoom(id);
        setRoom(data);
      } catch {
        toast.error("Failed to load room details.");
        navigate("/guest/rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = room
    ? (nights * parseFloat(room.price_per_night)).toFixed(2)
    : "0.00";

  const handleBook = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({
        room: room.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
      });
      toast.success(`Booking confirmed! Ref: ${booking.booking_reference}`);
      navigate("/guest/bookings");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Booking failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-64 bg-slate-800 rounded-2xl" />
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-800 rounded w-2/3" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/guest/rooms")}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        Back to Rooms
      </button>

      {/* Room image */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-800">
        {room.image ? (
          <img
            src={`${CLOUDINARY_BASE}${room.image}`}
            alt={`Room ${room.room_number}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BedDouble size={48} className="text-slate-600" />
          </div>
        )}
        <span
          className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full capitalize backdrop-blur-sm ${statusStyles[room.status] || statusStyles.maintenance}`}
        >
          {room.status}
        </span>
      </div>

      {/* Room info + booking form side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room details */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Room {room.room_number}
            </h2>
            <p className="text-slate-400 text-sm capitalize mt-1">
              {roomTypeLabels[room.room_type] || room.room_type} · Floor{" "}
              {room.floor}
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Users size={15} />
            <span>
              Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}
            </span>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              {room.description}
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4 flex items-end justify-between">
            <p className="text-slate-400 text-sm">Price per night</p>
            <p className="text-amber-400 font-bold text-2xl">
              KES {parseFloat(room.price_per_night).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Booking form */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <CalendarCheck size={18} className="text-amber-400" />
            Book This Room
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut("");
                }}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Price summary */}
          {nights > 0 && (
            <div className="bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>
                  KES {parseFloat(room.price_per_night).toLocaleString()} ×{" "}
                  {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>KES {parseFloat(totalPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-600 pt-2">
                <span>Total</span>
                <span className="text-amber-400">
                  KES {parseFloat(totalPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={submitting || room.status !== "available" || nights <= 0}
            className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {submitting
              ? "Booking..."
              : room.status !== "available"
              ? "Room Unavailable"
              : nights > 0
              ? `Confirm Booking — KES ${parseFloat(totalPrice).toLocaleString()}`
              : "Select Dates to Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;