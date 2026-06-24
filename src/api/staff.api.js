import api from "./axios";

export const getStaffList = async () => {
  const { data } = await api.get("/auth/staff/");
  return data;
};

export const registerStaff = async (payload) => {
  const { data } = await api.post("/auth/staff/register/", payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/auth/users/${id}/`, payload);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/auth/users/${id}/`);
};