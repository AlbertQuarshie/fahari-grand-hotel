import api from "./axios";

export const getMyTasks = async () => {
  const { data } = await api.get("/auth/housekeeping/");
  return data;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/auth/housekeeping/${id}/`, { status });
  return data;
};

export const getMaintenanceRequests = async () => {
  const { data } = await api.get("/auth/maintenance/");
  return data;
};

export const updateMaintenanceStatus = async (id, status) => {
  const { data } = await api.patch(`/auth/maintenance/${id}/`, { status });
  return data;
};