import api from "./axios";

export const createMaintenanceRequest = async (payload) => {
  const { data } = await api.post("/auth/maintenance/", payload);
  return data;
};

export const getMyMaintenanceRequests = async () => {
  const { data } = await api.get("/auth/maintenance/");
  return data;
};