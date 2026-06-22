import api from "./axios";

export const getRooms = async (filters = {}) => {
  const { data } = await api.get("/auth/rooms/", { params: filters });
  return data;
};

export const getRoom = async (id) => {
  const { data } = await api.get(`/auth/rooms/${id}/`);
  return data;
};