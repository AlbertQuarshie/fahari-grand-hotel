import { useEffect, useState } from "react";
import { createWalkInBooking } from "../../api/receptionist.api";
import { getRooms } from "../../api/rooms.api";
import { BedDouble, User, CalendarCheck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const WalkInBooking = () => {
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
          <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
        ))}
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl border border-green-500/30 p-8 text-center space-y-5">
          <CheckCircle size={48} className="text-green-400 mx-auto" />
          <div>
            <h3 className="text-white font-bold text-xl">Walk-in Booked!</h3>
            <p className="text-slate-400 text-sm mt-1">Booking confirmed successfully.</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Reference</span>
              <span className="text-white font-mono">{success.booking_reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guest</span>
              <span className="text-white">{success.guest_username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Room</span>
              <span className="text-white">Room {success.room_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dates</span>
              <span className="text-white">{success.check_in_date} → {success.check_out_date}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-slate-400">Total</span>
              <span className="text-amber-400 font-bold">
                KES {parseFloat(success.total_price).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
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
        <h2 className="text-2xl font-bold text-white">Walk-in Booking</h2>
        <p className="text-slate-400 text-sm mt-1">
          Create a booking for a guest at the front desk.
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">

        {/* Guest ID input */}
        <div>
          <label className="flex items-center gap-2 text-slate-300 text-sm mb-2">
            <User size={15} className="text-amber-400" />
            Guest ID
          </label>
          <input
            type="number"
            name="guest"
            value={form.guest}
            onChange={handleChange}
            placeholder="Enter the guest's user ID"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
          />
          <p className="text-slate-500 text-xs mt-1">
            Ask the guest for their registered user ID or look it up in the admin panel.
          </p>
        </div>

        {/* Room select */}
        <div>
          <label className="flex items-center gap-2 text-slate-300 text-sm mb-2">
            <BedDouble size={15} className="text-amber-400" />
            Select Room
          </label>
          <select
            name="room"
            value={form.room}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
          >
            <option value="">— Choose a room —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.room_number} — {r.room_type} · KES {parseFloat(r.price_per_night).toLocaleString()}/night
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <CalendarCheck size={15} className="text-amber-400" />
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
              className="w-full px-3 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">Check-out Date</label>
            <input
              type="date"
              name="check_out_date"
              min={form.check_in_date || today}
              value={form.check_out_date}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Price summary */}
        {nights > 0 && selectedRoom && (
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>
                KES {parseFloat(selectedRoom.price_per_night).toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>KES {parseFloat(totalPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white font-bold border-t border-slate-600 pt-2">
              <span>Total</span>
              <span className="text-amber-400">KES {parseFloat(totalPrice).toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm"
        >
          {submitting ? "Creating Booking..." : "Confirm Walk-in Booking"}
        </button>
      </div>
    </div>
  );
};

export default WalkInBooking;