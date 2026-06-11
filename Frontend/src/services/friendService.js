import api from "./api";

export const friendService = {

  getFriends: async () => {
    const res = await api.get("/api/friends");
    return res;
  },

  addFriend: async (userId) => {
    const res = await api.post(`/api/friends/request/${userId}`);
    return res.data;
  },

  acceptRequest: async (friendshipId) => {
    const res = await api.patch(`/api/friends/accept/${friendshipId}`);
    return res.data;
  },

  rejectRequest: async (friendshipId) => {
    const res = await api.patch(`/api/friends/reject/${friendshipId}`);
    return res.data;
  },

  getPendingRequests: async () => {
    const res = await api.get("/api/friends/pending");
    return res;
  },

  removeFriend: async (friendId) => {
    const res = await api.delete(`/api/friends/${friendId}`);
    return res.data;
  },


  searchUsers: async (query) => {
    const res = await api.get(`/api/users/search?q=${query}`);
    return res;
  },
};