import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Fetch approved reviews only
export const getApprovedReviews = async () => {
  const response = await axios.get(`${API_BASE_URL}/reviews/approved/`);
  return response.data;
};

// Fetch all reviews (admin only)
export const getAllReviews = async () => {
  const response = await axios.get(`${API_BASE_URL}/reviews/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });
  return response.data;
};

// Create a review (guest only)
export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_BASE_URL}/reviews/`, reviewData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });
  return response.data;
};

// Update review status (admin only)
export const updateReviewStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_BASE_URL}/reviews/${id}/`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    }
  );
  return response.data;
};