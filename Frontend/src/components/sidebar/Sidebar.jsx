import { useState, useEffect, useRef } from "react";
import FriendItem from "./FriendItem";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import { friendService } from "../../services/friendService";

function Sidebar() {
  const {
    friends,
    loadFriends,                           // ← from context, no local duplicate
    handleLogout, setProfilePanel, toast,
    friendRequests, showRequests, setShowRequests,
    acceptFriendRequest, rejectFriendRequest,
  } = useApp();

  const bellRef = useRef(null);

  const [query, setQuery]               = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch]     = useState(false);
  const [addingId, setAddingId]         = useState(null);

  // Close bell dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowRequests(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSearch(q) {
    setQuery(q);
    if (q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    try {
      const res = await friendService.searchUsers(q);
      setSearchResults((res.data?.data || res.data || []).filter(u => u.role !== "ADMIN"));
      setShowSearch(true);
    } catch {
      toast("Search failed");
    }
  }

  async function handleAddFriend(userId, name) {
    if (addingId === userId) return;
    setAddingId(userId);
    try {
      await friendService.addFriend(Number(userId));
      toast(`Friend request sent to ${name}!`);
      setShowSearch(false);
      setQuery("");
      setSearchResults([]);
    } catch (err) {
      const msg = err.response?.data?.message || "Already friends or request pending";
      toast(msg);
    } finally {
      setAddingId(null);
    }
  }

  // When searching, show search results in the friends list area
  // When not searching, show actual friends filtered by query
  const isSearching = query.length >= 2 && showSearch;
  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.username.toLowerCase().includes(query.toLowerCase())
  );

  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = ((me.firstName?.[0] || "") + (me.lastName?.[0] || "")).toUpperCase() || "?";
  const fullName = `${me.firstName || ""} ${me.lastName || ""}`.trim();

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Logo size={30} />
          <span>Hello <em>Talk</em></span>
        </div>

        {/* Bell icon with friend request badge */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setShowRequests(prev => !prev)}
            style={{ position: "relative" }}
            title="Friend requests"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {friendRequests.length > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--danger)",
                border: "2px solid var(--bg-secondary)",
              }} />
            )}
          </button>

          {/* Dropdown */}
          {showRequests && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 280, background: "var(--bg-tertiary)",
              border: "1px solid var(--border)", borderRadius: 12,
              zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid var(--border)",
                fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
              }}>
                Friend Requests {friendRequests.length > 0 && (
                  <span style={{
                    background: "var(--danger)", color: "#fff",
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    padding: "2px 7px", marginLeft: 6,
                  }}>{friendRequests.length}</span>
                )}
              </div>

              {friendRequests.length === 0 ? (
                <div style={{
                  padding: "20px 16px", color: "var(--text-muted)",
                  fontSize: 13, textAlign: "center",
                }}>
                  No pending requests
                </div>
              ) : (
                friendRequests.map(req => (
                  <div key={req.friendshipId} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderBottom: "1px solid var(--border)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#6c63ff20", color: "#a09cf5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                    }}>
                      {req.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {req.fromName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        @{req.fromUsername}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => acceptFriendRequest(req.friendshipId, req.fromId, req.fromName)}
                        style={{
                          background: "var(--accent)", border: "none", borderRadius: 7,
                          padding: "5px 10px", color: "#fff", fontSize: 11,
                          fontWeight: 600, cursor: "pointer",
                        }}
                      >Accept</button>
                      <button
                        onClick={() => rejectFriendRequest(req.friendshipId)}
                        style={{
                          background: "rgba(240,107,107,0.12)",
                          border: "1px solid rgba(240,107,107,0.25)",
                          borderRadius: 7, padding: "5px 10px",
                          color: "var(--danger)", fontSize: 11,
                          fontWeight: 600, cursor: "pointer",
                        }}
                      >Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <div className="search-input-wrap" style={{ position: "relative" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            placeholder="Search or add friends…"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />

          {/* Search results dropdown — for adding new users */}
          {isSearching && searchResults.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--bg-tertiary)", border: "1px solid var(--border)",
              borderRadius: 10, zIndex: 100, maxHeight: 200, overflowY: "auto",
            }}>
              {searchResults.map(u => (
                <div
                  key={u.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onMouseDown={() => handleAddFriend(u.id, u.firstName)}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "#6c63ff20", color: "#a09cf5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600,
                  }}>
                    {u.firstName?.[0]}{u.lastName?.[0] || ""}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{u.username}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                    {addingId === u.id ? "Sending…" : "+ Add"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Friends list */}
      <div className="friends-list">
        {filtered.length === 0 && query.length === 0 && (
          <div style={{ padding: "24px 18px", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
            No friends yet. Search to add someone!
          </div>
        )}
        {filtered.map(f => <FriendItem key={f.id} friend={f} />)}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="avatar avatar-sm" onClick={() => setProfilePanel("own")} style={{ cursor: "pointer" }}>
          <div className="avatar-img" style={{ background: "#2bab8c20", color: "var(--accent)" }}>{initials}</div>
          <div className="avatar-dot dot-online" />
        </div>
        <div className="own-info">
          <div className="own-name">{fullName}</div>
          <div className="own-tag">@{me.username || ""}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
