import { Client } from "@stomp/stompjs";

let stompClient = null;

export const socketService = {
  connect: (onMessageReceived, onPresenceReceived, onFriendRequestReceived) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ FIX: Don't reconnect if already connected — prevents duplicate subscriptions
    // which caused friend request notifications to fire multiple times
    if (stompClient?.connected) return;

    stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        console.log("✅ WebSocket connected successfully");

        stompClient.subscribe("/user/queue/messages", (msg) => {
          console.log("📨 Message received:", msg.body);
          onMessageReceived(JSON.parse(msg.body));
        });

        stompClient.subscribe("/topic/presence", (msg) => {
          const presence = JSON.parse(msg.body);
          console.log("👤 Presence:", presence);
          if (onPresenceReceived) onPresenceReceived(presence);
        });

        stompClient.subscribe("/user/queue/friend-requests", (msg) => {
          const data = JSON.parse(msg.body);
          console.log("🤝 Friend request:", data);
          if (onFriendRequestReceived) onFriendRequestReceived(data);
        });
      },
      onDisconnect: () => console.log("❌ WebSocket disconnected"),
      onStompError: (frame) => console.error("❌ STOMP error:", frame),
      onWebSocketError: (error) => console.error("❌ WebSocket error:", error),
    });

    stompClient.activate();
  },

  sendMessage: (receiverId, content) => {
    if (stompClient?.connected) {
      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ receiverId, content, messageType: "TEXT" }),
      });
    } else {
      console.warn("⚠️ WebSocket not connected, cannot send message");
    }
  },

  disconnect: () => {
    stompClient?.deactivate();
    stompClient = null; // ✅ FIX: clear reference so next connect() works cleanly
  },
};