import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom } from "../../api/rooms.api";
import { createBooking } from "../../api/bookings.api";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, card, input, btnNavy, btnGhost, skeleton, badge,
} from "../../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const roomTypeLabels = { single: "Single", double: "Double", suite: "Suite" };

const today = new Date().toISOString().split("T")[0];

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [submitting, setSubmitting] = useState(false);

  usePageTitle(
    room ? `${roomTypeLabels[room.room_type] || room.room_type} Room` : "Room Details"
  );

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
        <div className={`h-64 ${skeleton}`} />
        <div className={`h-8 ${skeleton} w-1/3`} />
        <div className={`h-4 ${skeleton} w-2/3`} />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate("/guest/rooms")} className={`text-sm ${btnGhost}`}>
        ← Back to Rooms
      </button>

      <div className="relative h-64 rounded overflow-hidden bg-[#0B1F3A]/5 border border-[#0B1F3A]/10">
        {room.image ? (
          <img
            src={`${CLOUDINARY_BASE}${room.image}`}
            alt={`Room ${room.room_number}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${display} text-[#0B1F3A]/40 font-bold text-2xl`}>
              Room {room.room_number}
            </span>
          </div>
        )}
        <span className={`absolute top-4 right-4 ${badge(room.status)}`}>
          {room.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} p-6 space-y-4`}>
          <div>
            <h2 className={`${display} text-2xl font-bold text-[#0B1F3A]`}>
              Room {room.room_number}
            </h2>
            <p className="text-[#0B1F3A] text-sm capitalize mt-1 font-semibold">
              {roomTypeLabels[room.room_type] || room.room_type} · Floor {room.floor}
            </p>
          </div>

          <p className="text-[#0B1F3A] text-sm font-semibold">
            Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}
          </p>

          <div className="border-t border-[#0B1F3A]/10 pt-4">
            <p className="text-[#0B1F3A] text-sm leading-relaxed">{room.description}</p>
          </div>

          <div className="border-t border-[#0B1F3A]/10 pt-4 flex items-end justify-between">
            <p className="text-[#0B1F3A] text-sm font-semibold">Price per night</p>
            <p className={`${display} text-[#0B1F3A] font-bold text-2xl`}>
              KES {parseFloat(room.price_per_night).toLocaleString()}
            </p>
          </div>
        </div>

        <div className={`${card} p-6 space-y-4`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>
            Book This Room
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-bold mb-1">
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
                className={input}
              />
            </div>

            <div>
              <label className="block text-[#0B1F3A] text-sm font-bold mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className={input}
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-[#FAF8F3] rounded p-4 space-y-2 text-sm border border-[#0B1F3A]/10">
              <div className="flex justify-between text-[#0B1F3A] font-semibold">
                <span>
                  KES {parseFloat(room.price_per_night).toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>KES {parseFloat(totalPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#0B1F3A] font-bold border-t border-[#0B1F3A]/10 pt-2">
                <span>Total</span>
                <span className="text-[#C9A24B]">
                  KES {parseFloat(totalPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={submitting || room.status !== "available" || nights <= 0}
            className={`w-full py-2.5 rounded text-sm ${btnNavy}`}
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
