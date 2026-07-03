import { useEffect, useState } from "react";
import { createWalkInBooking } from "../../api/receptionist.api";
import { getRooms } from "../../api/rooms.api";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  pageTitle,
  pageSubtitle,
  card,
  input,
  select,
  btnPrimary,
  skeleton,
  display,
  sectionLabel,
} from "../../constants/theme";

const WalkInBooking = () => {
  usePageTitle("Walk-In Booking");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    guest: "",
    room: "",
    check_in_date: "",
    check_out_date: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomData = await getRooms({ status: "available" });
        setRooms(roomData);
      } catch {
        toast.error("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const nights =
    form.check_in_date && form.check_out_date
      ? Math.max(
          0,
          (new Date(form.check_out_date) - new Date(form.check_in_date)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const selectedRoom = rooms.find((r) => String(r.id) === String(form.room));
  const totalPrice = selectedRoom
    ? (nights * parseFloat(selectedRoom.price_per_night)).toFixed(2)
    : "0.00";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.guest || !form.room || !form.check_in_date || !form.check_out_date) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (isNaN(parseInt(form.guest))) {
      toast.error("Guest ID must be a number.");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createWalkInBooking({
        guest: parseInt(form.guest),
        room: parseInt(form.room),
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
      });
      setSuccess(booking);
      toast.success(`Walk-in booked! Ref: ${booking.booking_reference}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setForm({ guest: "", room: "", check_in_date: "", check_out_date: "" });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-16 ${skeleton}`} />
        ))}
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className={`${card} p-8 text-center space-y-5 border-[#C9A24B]/40`}>
          <div>
            <p className={sectionLabel}>Confirmed</p>
            <h3 className={`${display} text-[#0B1F3A] font-bold text-xl mt-1`}>
              Walk-in Booked!
            </h3>
            <p className="text-[#0B1F3A] text-sm mt-1 font-semibold">
              Booking confirmed successfully.
            </p>
          </div>
          <div className="bg-[#FAF8F3] rounded p-4 text-left space-y-2 text-sm border border-[#0B1F3A]/10">
            <div className="flex justify-between">
              <span className="text-[#0B1F3A]/70 font-semibold">Reference</span>
              <span className="text-[#0B1F3A] font-mono font-bold">
                {success.booking_reference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0B1F3A]/70 font-semibold">Guest</span>
              <span className="text-[#0B1F3A] font-bold">{success.guest_username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0B1F3A]/70 font-semibold">Room</span>
              <span className="text-[#0B1F3A] font-bold">Room {success.room_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0B1F3A]/70 font-semibold">Dates</span>
              <span className="text-[#0B1F3A] font-bold">
                {success.check_in_date} → {success.check_out_date}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#0B1F3A]/10 pt-2">
              <span className="text-[#0B1F3A]/70 font-semibold">Total</span>
              <span className={`${display} text-[#0B1F3A] font-bold`}>
                KES {parseFloat(success.total_price).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
          >
            New Walk-in Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className={pageTitle}>Walk-in Booking</h2>
        <p className={pageSubtitle}>
          Create a booking for a guest at the front desk.
        </p>
      </div>

      <div className={`${card} p-6 space-y-5`}>
        <div>
          <label className="block text-[#0B1F3A] text-sm mb-2 font-bold">
            Guest ID
          </label>
          <input
            type="number"
            name="guest"
            value={form.guest}
            onChange={handleChange}
            placeholder="Enter the guest's user ID"
            className={input}
          />
          <p className="text-[#0B1F3A]/70 text-xs mt-1 font-semibold">
            Ask the guest for their registered user ID or look it up in the admin panel.
          </p>
        </div>

        <div>
          <label className="block text-[#0B1F3A] text-sm mb-2 font-bold">
            Select Room
          </label>
          <select
            name="room"
            value={form.room}
            onChange={handleChange}
            className={`w-full ${select}`}
          >
            <option value="">— Choose a room —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.room_number} — {r.room_type} · KES {parseFloat(r.price_per_night).toLocaleString()}/night
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#0B1F3A] text-sm mb-2 font-bold">
              Check-in Date
            </label>
            <input
              type="date"
              name="check_in_date"
              min={today}
              value={form.check_in_date}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  check_in_date: val,
                  check_out_date: prev.check_out_date && val >= prev.check_out_date ? "" : prev.check_out_date,
                }));
              }}
              className={input}
            />
          </div>
          <div>
            <label className="block text-[#0B1F3A] text-sm mb-2 font-bold">
              Check-out Date
            </label>
            <input
              type="date"
              name="check_out_date"
              min={form.check_in_date || today}
              value={form.check_out_date}
              onChange={handleChange}
              className={input}
            />
          </div>
        </div>

        {nights > 0 && selectedRoom && (
          <div className="bg-[#FAF8F3] rounded p-4 space-y-2 text-sm border border-[#0B1F3A]/10">
            <div className="flex justify-between text-[#0B1F3A] font-semibold">
              <span>
                KES {parseFloat(selectedRoom.price_per_night).toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>KES {parseFloat(totalPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-[#0B1F3A]/10 pt-2">
              <span className="text-[#0B1F3A] font-bold">Total</span>
              <span className={`${display} text-[#0B1F3A] font-bold`}>
                KES {parseFloat(totalPrice).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-2.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}
        >
          {submitting ? "Creating Booking..." : "Confirm Walk-in Booking"}
        </button>
      </div>
    </div>
  );
};

export default WalkInBooking;
