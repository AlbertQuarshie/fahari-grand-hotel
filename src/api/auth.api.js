import api from "./axios";

export const loginUser = async (username, password) => {
  const { data } = await api.post("/auth/login/", { username, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me/");
  return data;
};

export const registerGuest = async (formData) => {
  const { data } = await api.post("/auth/register/", formData);
  return data;
};

export const refreshToken = async (refresh) => {
  const { data } = await api.post("/auth/refresh/", { refresh });
  return data;
};