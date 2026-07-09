import api from "./axios";

export const sendContactMessage = async (payload) => {
  const { data } = await api.post("/auth/contact-messages/", payload);
  return data;
};