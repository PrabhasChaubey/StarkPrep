import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1", // backend route prefix
  withCredentials: true, // very important for cookie-based auth
});

// Register API
export const registerUser = (formData) => {
  return axiosInstance.post("/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Login API (example)
export const loginUser = (payload) => {
  return axiosInstance.post("/users/login", payload);
};
