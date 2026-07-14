import api from "./axios";

export const getAdminDashboard = async () => {
  const { data } = await api.get("/auth/admin/dashboard/");
  return data;
};

export const getStaffList = async () => {
  const { data } = await api.get("/auth/staff/");
  return data;
};

export const getUserList = async () => {
  const { data } = await api.get("/auth/users/");
  return data;
};

export const getPayments = async () => {
  const { data } = await api.get("/auth/payments/");
  return data;
};

export const getReviews = async () => {
  const { data } = await api.get("/auth/reviews/");
  return data;
};

export const approveReview = async (id) => {
  const { data } = await api.patch(`/auth/reviews/${id}/`, { is_approved: true });
  return data;
};

export const deleteReview = async (id) => {
  await api.delete(`/auth/reviews/${id}/`);
};

export const getAllRooms = async () => {
  const { data } = await api.get("/auth/rooms/");
  return data;
};

export const createRoom = async (formData) => {
  const { data } = await api.post("/auth/rooms/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateRoom = async (id, formData) => {
  const { data } = await api.patch(`/auth/rooms/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteRoom = async (id) => {
  await api.delete(`/auth/rooms/${id}/`);
};

export const uploadRoomImage = async (roomId, file, caption = "") => {
  const fd = new FormData();
  fd.append("room", roomId);
  fd.append("image", file);
  if (caption) fd.append("caption", caption);
  const { data } = await api.post("/auth/room-images/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteRoomImage = async (imageId) => {
  await api.delete(`/auth/room-images/${imageId}/`);
};

export const getAllMaintenance = async () => {
  const { data } = await api.get("/auth/maintenance/");
  return data;
};

export const updateMaintenanceStatus = async (id, status) => {
  const { data } = await api.patch(`/auth/maintenance/${id}/`, { status });
  return data;
};

export const getAllHousekeeping = async () => {
  const { data } = await api.get("/auth/housekeeping/");
  return data;
};

export const createHousekeepingTask = async (payload) => {
  const { data } = await api.post("/auth/housekeeping/", payload);
  return data;
};

export const updateHousekeepingTask = async (id, payload) => {
  const { data } = await api.patch(`/auth/housekeeping/${id}/`, payload);
  return data;
};