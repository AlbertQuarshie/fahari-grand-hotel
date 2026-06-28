import api from "./axios";

// Get approved/all reviews — public, used on Landing page
export const getApprovedReviews = async () => {
  const response = await api.get("/auth/reviews/");
  return response.data;
};

// Get current guest's own reviews — used in LeaveReview.jsx
export const getMyReviews = async () => {
  const response = await api.get("/auth/reviews/");
  // Filter client-side to the logged-in user's reviews since there is
  // no separate my-reviews endpoint on the backend.
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return [];
  return response.data.filter((r) => r.guest === user.id || r.guest_username === user.username);
};

// Submit a new review — used in LeaveReview.jsx
export const submitReview = async (reviewData) => {
  const response = await api.post("/auth/reviews/", reviewData);
  return response.data;
};

// Admin: get all reviews
export const getAllReviews = async () => {
  const response = await api.get("/auth/reviews/");
  return response.data;
};

// Admin: update a review (e.g. approval status, if you keep that field)
export const updateReviewStatus = async (id, payload) => {
  const response = await api.patch(`/auth/reviews/${id}/`, payload);
  return response.data;
};