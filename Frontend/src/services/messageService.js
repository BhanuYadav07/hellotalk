import api from "./api";

export const messageService = {

  getConversation: async (friendId) => {
    const res = await api.get(`/api/messages/conversation/${friendId}`);
    return res.data;
  },

  sendMessage: async (receiverId, content) => {
    const res = await api.post(`/api/messages/`,{receiverId,content,messageType:"TEXT"});
    return res;
  },

};