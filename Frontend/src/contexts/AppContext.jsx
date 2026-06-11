import { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../services/socketService";
import { authService } from "../services/authService";
import { messageService } from "../services/messageService";
import { friendService } from "../services/friendService";

const AppContext = createContext(null);

export function AppProvider({ children }) {

  const [screen, setScreen] = useState(() => {
    try {
      const t = localStorage.getItem("token");
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (!t || !u?.id) return "login";
      if (u.role === "ADMIN") return "admin";
      return "main";
    } catch {
      return "login";
    }
  });

  const [friends, setFriends]               = useState([]);
  const [currentFriend, setCurrentFriend]   = useState(null);
  const [toastMsg, setToastMsg]             = useState("");
  const [toastVisible, setToastVisible]     = useState(false);
  const [profilePanel, setProfilePanel]     = useState(null);
  const [pendingEmail, setPendingEmail]     = useState("");
  const [pendingOtpType, setPendingOtpType] = useState("SIGNUP");

  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests]     = useState(false);

  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && screen === "main") {
      // ✅ FIX: socketService.connect() now guards against reconnecting,
      // so removing the manual disconnect() here prevents subscription loss
      connectSocket();
      loadFriends();
      loadPendingRequests();
    }
  }, [screen]);

  async function loadFriends() {
    try {
      const res = await friendService.getFriends();
      // ✅ FIX: friendService.getFriends() now returns full axios res (not res.data)
      const list = res.data?.data || res.data || [];
      const mapped = list.map(u => ({
        id: u.id,
        name: u.firstName + " " + (u.lastName || ""),
        username: u.username,
        initials: (u.firstName[0] + (u.lastName?.[0] || "")).toUpperCase(),
        color: "#6c63ff20",
        tc: "#a09cf5",
        status: (u.status || "OFFLINE").toLowerCase(),
        msgs: [],
        unread: 0,
      }));
      setFriends(mapped);
    } catch (err) {
      console.error("Failed to load friends:", err);
    }
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await friendService.searchUsers(query);
      // ✅ FIX: friendService.searchUsers() now returns full axios res (not res.data)
      const list = res.data?.data || res.data || [];
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      setSearchResults(
        list
          .filter(u => u.id !== currentUser.id)
          .map(u => ({
            id: u.id,
            name: u.firstName + " " + (u.lastName || ""),
            username: u.username,
            initials: (u.firstName[0] + (u.lastName?.[0] || "")).toUpperCase(),
            color: "#6c63ff20",
            tc: "#a09cf5",
            status: (u.status || "OFFLINE").toLowerCase(),
            alreadyFriend: friends.some(f => f.id === u.id),
          }))
      );
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    }
  }

  async function loadPendingRequests() {
    try {
      const res = await friendService.getPendingRequests();
      // ✅ FIX: friendService.getPendingRequests() now returns full axios res (not res.data)
      const list = res.data?.data || res.data || [];
      const mapped = list.map(u => {
        if (!u.friendshipId) {
          console.warn("Missing friendshipId for:", u);
        }
        return {
          friendshipId: u.friendshipId ?? u.id ?? u.requestId ?? u.friendship_id,
          fromId: u.id,
          fromName: u.firstName + " " + (u.lastName || ""),
          fromUsername: u.username,
          initials: (u.firstName[0] + (u.lastName?.[0] || "")).toUpperCase(),
        };
      });
      setFriendRequests(mapped);
    } catch (err) {
      console.error("Failed to load pending requests", err);
    }
  }

  function toast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }

  function connectSocket() {
    socketService.connect(
      // 1. Incoming chat message
      (incomingMsg) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isOut = incomingMsg.senderId === user.id;
        const otherPersonId = isOut ? incomingMsg.receiverId : incomingMsg.senderId;

        const msg = {
          out: isOut,
          text: incomingMsg.content,
          time: new Date(incomingMsg.sentAt).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit",
          }),
        };

        setCurrentFriend(prev => {
          if (prev && prev.id === otherPersonId) {
            return { ...prev, msgs: [...prev.msgs, msg] };
          }
          return prev;
        });

        setFriends(prev =>
          prev.map(f =>
            f.id === otherPersonId
              ? { ...f, msgs: [...f.msgs, msg], unread: isOut ? f.unread : f.unread + 1 }
              : f
          )
        );
      },

      // 2. Presence update
      (presence) => {
        setFriends(prev =>
          prev.map(f =>
            f.username === presence.username
              ? { ...f, status: presence.status.toLowerCase() }
              : f
          )
        );
      },

      // 3. Incoming friend request — real-time
      (friendReq) => {
        console.log("🤝 Friend request received:", JSON.stringify(friendReq));
        const fId = friendReq.friendshipId || friendReq.id;

        setFriendRequests(prev => {
          const exists = prev.find(r => r.friendshipId === fId);
          if (exists) return prev; // ✅ FIX: duplicate — silently ignore, no toast

          // ✅ FIX: toast moved inside setter so it only fires for NEW requests
          toast(`Friend request from ${friendReq.from || friendReq.fromName || "someone"}!`);

          return [...prev, {
            friendshipId: fId,
            fromId: friendReq.fromId || friendReq.senderId,
            fromName: friendReq.fromName || friendReq.from,
            fromUsername: friendReq.from || friendReq.fromUsername,
            initials: (friendReq.from?.[0] || friendReq.fromName?.[0] || "?").toUpperCase(),
          }];
        });
      }
    );
  }

  async function acceptFriendRequest(friendshipId, fromId, fromName) {
    try {
      if (!friendshipId) {
  toast("Invalid request — missing ID");
  return;
}
      await friendService.acceptRequest(friendshipId);
      setFriendRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
      toast(`You and ${fromName} are now friends!`);
      await loadFriends();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to accept request");
    }
  }

  async function rejectFriendRequest(friendshipId) {
    try {
      await friendService.rejectRequest(friendshipId);
      setFriendRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
      toast("Request rejected.");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to reject request");
    }
  }

  async function openChat(friend) {
    const base = { ...friend, unread: 0 };
    setCurrentFriend(base);
    try {
      const data = await messageService.getConversation(friend.id);
      // ✅ FIX: messageService.getConversation() now returns full axios res (not res.data)
      const user = JSON.parse(localStorage.getItem("user"));
      const mapped = (data.data?.data || data.data || []).map(m => ({
        out: m.senderId === user.id,
        text: m.content,
        time: new Date(m.sentAt).toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit",
        }),
      }));
      setCurrentFriend({ ...base, msgs: mapped });
      setFriends(prev => prev.map(f =>
        f.id === friend.id ? { ...f, unread: 0, msgs: mapped } : f
      ));
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  function sendMessage(text) {
    if (!currentFriend || !text.trim()) return;
    socketService.sendMessage(currentFriend.id, text.trim());
  }

  function deleteFriend(id) {
    setFriends(prev => prev.filter(f => f.id !== id));
    setCurrentFriend(null);
    setProfilePanel(null);
    toast("Friend removed.");
  }

  function handleLogout() {
    authService.logout();
    socketService.disconnect();
    setFriends([]);
    setCurrentFriend(null);
    setFriendRequests([]);
    setScreen("login");
    toast("Logged out");
  }

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      friends, setFriends,
      currentFriend, setCurrentFriend,
      toastMsg, toastVisible,
      toast,
      profilePanel, setProfilePanel,
      pendingEmail, setPendingEmail,
      pendingOtpType, setPendingOtpType,
      openChat,
      sendMessage,
      deleteFriend,
      connectSocket,
      handleLogout,
      loadFriends,
      searchQuery, setSearchQuery,
      searchResults, setSearchResults,
      handleSearch,
      friendRequests,
      showRequests, setShowRequests,
      acceptFriendRequest,
      rejectFriendRequest,
      loadPendingRequests,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}