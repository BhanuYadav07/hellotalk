import api from "./api";

export const authService = {

  signup: async (data) => {
    const res = await api.post("/api/auth/signup", data);
    return res.data;
  },

  verifyOtp: async (email, code, purpose = "SIGNUP") => {
    const res = await api.post("/api/auth/verify-otp", { email, code, purpose });
    localStorage.setItem("token", res.data.token);
    const user = res.data.user||res.data;
    localStorage.setItem("user", JSON.stringify(user));
    return res.data;
  },

  login: async (username, password) => {
    const res = await api.post("/api/auth/login", { username, password });
    localStorage.setItem("token", res.data.token);
      const user = res.data.user || res.data;
    localStorage.setItem("user", JSON.stringify(user));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  forgotPassword: async (username, email) => {
    const res = await api.post("/api/auth/forgot-password", { username, email });
    return res.data;
  },

  resetPassword: async (email, code, newPassword) => {
    const res = await api.post("/api/auth/reset-password", { email, code, newPassword });
    return res.data;
  },

  resendOtp: async (email, type = "SIGNUP") => {
    const res = await api.post(`/api/auth/resend-otp?email=${email}&type=${type}`);
    return res.data;
  },
};