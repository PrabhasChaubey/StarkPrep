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

// ✅ Fetch current logged-in user with full profileStats
export const fetchCurrentUser = async () => {
  const res = await axiosInstanceV1.get("/users/current-user");
  return res.data.data; // this is `req.user`
};

// Codeforces refresh
export const refreshCodeforcesStats = async (handle) => {
  return axiosInstanceV1.post('/users/verify/cf', { handle });
};

// Leetcode refresh
export const refreshLeetcodeStats = async () => {
  return axiosInstanceV1.get('/users/leetcode/stats');
};



// Contest API
export const fetchContests = async () => {
  const res = await axiosInstanceV4.get("/contests/upcoming");
  return res.data.data;
};

//update profile
export const updateProfile = async (formData) => {
  const res = await axiosInstanceV1.patch('/users/update-profile-info', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};


// Step 1: Get Leetcode token
export const initiateLeetcodeVerification = async () => {
  const res = await axiosInstanceV1.post("/users/leetcode/initiate-verification");
  return res.data.data; // returns { token }
};

// Step 2: Verify Leetcode handle using token
export const verifyLeetcodeProfile = async (payload) => {
  const res = await axiosInstanceV1.post("/users/leetcode/verify", payload);
  return res.data.data; // returns verification status
};

