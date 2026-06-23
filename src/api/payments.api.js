import api from "./axios";

export const initiatePayment = async (bookingId, phoneNumber) => {
  const { data } = await api.post(`/auth/bookings/${bookingId}/pay/`, {
    phone_number: phoneNumber,
  });
  return data;
};

export const getPaymentStatus = async (bookingId) => {
  const { data } = await api.get(`/auth/bookings/${bookingId}/payment/`);
  return data;
};