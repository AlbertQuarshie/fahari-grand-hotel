import api from "./axios";

export const submitReview = async (payload) => {
  const { data } = await api.post("/auth/reviews/", payload);
  return data;
};

export const getMyReviews = async () => {
  const { data } = await api.get("/auth/reviews/");
  return data;
};