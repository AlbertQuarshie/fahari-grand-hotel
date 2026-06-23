import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initiatePayment, getPaymentStatus } from "../../api/payments.api";
import { getMyBookings } from "../../api/bookings.api";
import { Smartphone, CheckCircle, XCircle, Loader, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const BookingPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("form"); // form | waiting | success | failed
  const [payment, setPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getMyBookings();
        const found = data.find((b) => String(b.id) === String(id));
        if (!found) {
          toast.error("Booking not found.");
          navigate("/guest/bookings");
        } else {
          setBooking(found);
        }
      } catch {
        toast.error("Failed to load booking.");
        navigate("/guest/bookings");
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your M-Pesa phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await initiatePayment(id, phone);
      setPayment(data.payment);
      setStep("waiting");
      toast.success("STK push sent! Check your phone and enter your PIN.");
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to initiate payment.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCheck = async () => {
    setChecking(true);
    try {
      const data = await getPaymentStatus(id);
      setPayment(data);
      if (data.status === "completed") {
        setStep("success");
      } else {
        toast.error(
          "Payment not confirmed yet. If you paid, wait a few seconds and try again."
        );
      }
    } catch {
      toast.error("Could not verify payment. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={24} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/guest/bookings")}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </button>

      {/* Booking summary */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-2">
        <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
          Booking Summary
        </p>
        <p className="text-white font-bold text-lg">Room {booking.room_number}</p>
        <p className="text-slate-400 text-sm font-mono">
          {booking.booking_reference}
        </p>
        <p className="text-slate-400 text-sm">
          {booking.check_in_date} → {booking.check_out_date}
        </p>
        <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total Due</span>
          <span className="text-amber-400 font-bold text-xl">
            KES {parseFloat(booking.total_price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Step: form */}
      {step === "form" && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Smartphone size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Pay via M-Pesa</p>
              <p className="text-slate-400 text-xs">
                An STK push will be sent to your phone
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-400 focus:outline-none text-sm"
            />
            <p className="text-slate-500 text-xs mt-1">
              Enter the number registered with M-Pesa
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition disabled:opacity-50 text-sm"
          >
            {submitting ? "Sending STK Push..." : "Pay Now"}
          </button>
        </div>
      )}

      {/* Step: waiting for user to complete payment */}
      {step === "waiting" && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
            <Smartphone size={28} className="text-green-400" />
          </div>

          <div className="space-y-1">
            <p className="text-white font-bold text-lg">Check Your Phone</p>
            <p className="text-slate-400 text-sm">
              An M-Pesa prompt has been sent to{" "}
              <span className="text-white font-mono">{phone}</span>.
              Enter your PIN to complete the payment.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 text-left space-y-1 text-sm">
            <p className="text-slate-400">
              Amount:{" "}
              <span className="text-white font-semibold">
                KES {parseFloat(booking.total_price).toLocaleString()}
              </span>
            </p>
            <p className="text-slate-400">
              Reference:{" "}
              <span className="text-white font-mono">
                {booking.booking_reference}
              </span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmCheck}
              disabled={checking}
              className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "I've Completed Payment"
              )}
            </button>

            <button
              onClick={() => setStep("form")}
              className="w-full py-2 text-slate-400 hover:text-white text-sm transition"
            >
              Send STK Push Again
            </button>
          </div>
        </div>
      )}

      {/* Step: success */}
      {step === "success" && (
        <div className="bg-slate-800 rounded-2xl border border-green-500/30 p-8 text-center space-y-4">
          <CheckCircle size={48} className="text-green-400 mx-auto" />
          <p className="text-white font-bold text-xl">Payment Successful!</p>
          <p className="text-slate-400 text-sm">
            Your booking has been confirmed.
          </p>
          {payment?.mpesa_receipt && (
            <p className="text-slate-400 text-sm">
              M-Pesa Receipt:{" "}
              <span className="text-white font-mono">{payment.mpesa_receipt}</span>
            </p>
          )}
          <button
            onClick={() => navigate("/guest/bookings")}
            className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
          >
            View My Bookings
          </button>
        </div>
      )}

      {/* Step: failed */}
      {step === "failed" && (
        <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-8 text-center space-y-4">
          <XCircle size={48} className="text-red-400 mx-auto" />
          <p className="text-white font-bold text-xl">Payment Failed</p>
          <p className="text-slate-400 text-sm">
            The payment was not completed. Please try again.
          </p>
          <button
            onClick={() => setStep("form")}
            className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPayment;