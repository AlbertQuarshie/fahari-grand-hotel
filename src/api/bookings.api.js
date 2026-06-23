import api from "./axios";

export const createBooking = async (bookingData) => {
  const { data } = await api.post("/auth/bookings/", bookingData);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get("/auth/bookings/");
  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.post(`/auth/bookings/${id}/cancel/`);
  return data;
};