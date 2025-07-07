import axios from "axios";

// Base for user/auth/etc. (v1)
export const axiosInstanceV1 = axios.create({
  baseURL: "http://localhost:8000/api/v1", // backend route prefix
  withCredentials: true, // very important for cookie-based auth
});

// Base for contest APIs (v4)
export const axiosInstanceV4 = axios.create({
  baseURL: "http://localhost:8000/api/v4",
  withCredentials: true,
});

// Register API
export const registerUser = (formData) => {
  return axiosInstanceV1.post("/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Login API (example)
export const loginUser = (payload) => {
  return axiosInstanceV1.post("/users/login", payload);
};

// Contest API
export const fetchContests = async () => {
  const res = await axiosInstanceV4.get("/contests/upcoming");
  return res.data.data;
};
