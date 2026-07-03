import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initiatePayment, getPaymentStatus } from "../../api/payments.api";
import { getMyBookings } from "../../api/bookings.api";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  display, card, input, btnPrimary, btnNavy, btnGhost,
} from "../../constants/theme";

const BookingPayment = () => {
  usePageTitle("Payment");
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("form");
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
        <p className="text-[#0B1F3A] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => navigate("/guest/bookings")} className={`text-sm ${btnGhost}`}>
        ← Back to Bookings
      </button>

      <div className={`${card} p-5 space-y-2`}>
        <p className="text-[#C9A24B] text-xs uppercase tracking-wide font-bold">
          Booking Summary
        </p>
        <p className={`${display} text-[#0B1F3A] font-bold text-lg`}>
          Room {booking.room_number}
        </p>
        <p className="text-[#0B1F3A] text-sm font-mono font-semibold">
          {booking.booking_reference}
        </p>
        <p className="text-[#0B1F3A] text-sm font-semibold">
          {booking.check_in_date} → {booking.check_out_date}
        </p>
        <div className="pt-2 border-t border-[#0B1F3A]/10 flex justify-between items-center">
          <span className="text-[#0B1F3A] text-sm font-semibold">Total Due</span>
          <span className={`${display} text-[#0B1F3A] font-bold text-xl`}>
            KES {parseFloat(booking.total_price).toLocaleString()}
          </span>
        </div>
      </div>

      {step === "form" && (
        <div className={`${card} p-6 space-y-5`}>
          <div>
            <p className={`${display} text-[#0B1F3A] font-bold`}>Pay via M-Pesa</p>
            <p className="text-[#0B1F3A] text-xs font-semibold mt-1">
              An STK push will be sent to your phone
            </p>
          </div>

          <div>
            <label className="block text-[#0B1F3A] text-sm font-bold mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={input}
            />
            <p className="text-[#0B1F3A] text-xs mt-1 font-semibold">
              Enter the number registered with M-Pesa
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-2.5 rounded text-sm ${btnNavy}`}
          >
            {submitting ? "Sending STK Push..." : "Pay Now"}
          </button>
        </div>
      )}

      {step === "waiting" && (
        <div className={`${card} p-6 space-y-5 text-center`}>
          <div className="space-y-1">
            <p className={`${display} text-[#0B1F3A] font-bold text-lg`}>Check Your Phone</p>
            <p className="text-[#0B1F3A] text-sm font-semibold">
              An M-Pesa prompt has been sent to{" "}
              <span className="font-mono font-bold">{phone}</span>.
              Enter your PIN to complete the payment.
            </p>
          </div>

          <div className="bg-[#FAF8F3] rounded p-4 text-left space-y-1 text-sm border border-[#0B1F3A]/10">
            <p className="text-[#0B1F3A] font-semibold">
              Amount:{" "}
              <span className="font-bold">
                KES {parseFloat(booking.total_price).toLocaleString()}
              </span>
            </p>
            <p className="text-[#0B1F3A] font-semibold">
              Reference:{" "}
              <span className="font-mono">{booking.booking_reference}</span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmCheck}
              disabled={checking}
              className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
            >
              {checking ? "Verifying..." : "I've Completed Payment"}
            </button>

            <button
              onClick={() => setStep("form")}
              className={`w-full py-2 text-sm ${btnGhost}`}
            >
              Send STK Push Again
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className={`${card} border-emerald-400 p-8 text-center space-y-4`}>
          <p className={`${display} text-emerald-800 font-bold text-xl`}>Payment Successful!</p>
          <p className="text-[#0B1F3A] text-sm font-semibold">
            Your booking has been confirmed.
          </p>
          {payment?.mpesa_receipt && (
            <p className="text-[#0B1F3A] text-sm font-semibold">
              M-Pesa Receipt:{" "}
              <span className="font-mono font-bold">{payment.mpesa_receipt}</span>
            </p>
          )}
          <button
            onClick={() => navigate("/guest/bookings")}
            className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
          >
            View My Bookings
          </button>
        </div>
      )}

      {step === "failed" && (
        <div className={`${card} border-red-400 p-8 text-center space-y-4`}>
          <p className={`${display} text-red-800 font-bold text-xl`}>Payment Failed</p>
          <p className="text-[#0B1F3A] text-sm font-semibold">
            The payment was not completed. Please try again.
          </p>
          <button
            onClick={() => setStep("form")}
            className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPayment;
