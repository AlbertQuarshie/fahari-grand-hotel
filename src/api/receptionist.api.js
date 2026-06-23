import api from "./axios";

export const getDailyRoster = async (date = "") => {
  const params = date ? { date } : {};
  const { data } = await api.get("/auth/receptionist/roster/", { params });
  return data;
};

export const createWalkInBooking = async (bookingData) => {
  const { data } = await api.post("/auth/receptionist/walkin/", bookingData);
  return data;
};

export const checkInOut = async (bookingId, action) => {
  const { data } = await api.post(`/auth/bookings/${bookingId}/checkinout/`, { action });
  return data;
};

export const confirmBooking = async (bookingId) => {
  const { data } = await api.post(`/auth/bookings/${bookingId}/confirm/`);
  return data;
};

export const getGuestList = async () => {
  const { data } = await api.get("/auth/users/");
  return data;
};

export const getGuestBookingHistory = async (guestId) => {
  const { data } = await api.get(`/auth/receptionist/guest/${guestId}/bookings/`);
  return data;
};