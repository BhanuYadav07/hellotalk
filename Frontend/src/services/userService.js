import api from "./api";

export const userService = {

  getMe: async () => {
    const res = await api.get("/api/users/me");
    return res.data;
  },
  
  
};