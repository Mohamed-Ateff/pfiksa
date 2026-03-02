import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  createUser: (userData) => api.post("/auth/create-user", userData),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getCurrentUser: () => api.get("/auth/me"),
};

// Report Services
export const reportService = {
  createReport: (reportData) => api.post("/reports", reportData),
  getAllReports: () => api.get("/reports/all"),
  getMyReports: () => api.get("/reports/my-reports"),
  getReportsByDate: (date) => api.get(`/reports/date/${date}`),
  updateReportStatus: (reportId, isChecked, approvalNotes) =>
    api.put(`/reports/${reportId}/status`, { isChecked, approvalNotes }),
  deleteReport: (reportId) => api.delete(`/reports/${reportId}`),
};

// Employee Services
export const employeeService = {
  getAllEmployees: () => api.get("/employees"),
  getEmployeeById: (employeeId) => api.get(`/employees/${employeeId}`),
  updateEmployee: (employeeId, data) =>
    api.put(`/employees/${employeeId}`, data),
};

// User Services (manager)
export const userService = {
  getAllUsers: () => api.get("/users"),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  updateUserPassword: (userId, password) =>
    api.put(`/users/${userId}/password`, { password }),
};

export default api;
