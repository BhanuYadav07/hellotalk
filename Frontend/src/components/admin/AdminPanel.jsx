import { useEffect, useState } from "react";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import api from "../../services/api";  // ← ADD THIS IMPORT

function AdminPanel() {
  const { setScreen, toast } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      setScreen("login");
      return;
    }

    if (user.role !== "ADMIN") {
      setScreen("main");
      return;
    }

    // ✅ REPLACED raw fetch with api.js
    api.get("/api/admin/users")
      .then(res => {
        setUsers(res.data.data || []);
      })
      .catch(() => toast("Failed to load users"))
      .finally(() => setLoading(false));

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setScreen("login");
    toast("Admin logged out");
  };

  // ✅ REPLACED raw fetch with api.js
  const blockUser = async (id) => {
    try {
      await api.patch(`/api/admin/users/${id}/block`);
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, isBlocked: true } : user
        )
      );
      toast("User blocked");
    } catch {
      toast("Failed to block user");
    }
  };

  // ✅ REPLACED raw fetch with api.js
  const unblockUser = async (id) => {
    try {
      await api.patch(`/api/admin/users/${id}/unblock`);
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, isBlocked: false } : user
        )
      );
      toast("User unblocked");
    } catch {
      toast("Failed to unblock user");
    }
  };

  return (
    <div style={{ padding: "25px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo size={35} />
          <h2>HelloTalk Admin Panel</h2>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {loading ? (
        <h3>Loading users...</h3>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Blocked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName} {user.lastName || ""}</td>
                <td>@{user.username}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>{user.isVerified ? "✅ Yes" : "❌ No"}</td>
                <td>{user.isBlocked ? "🚫 Blocked" : "✅ Active"}</td>
                <td>
                  {user.isBlocked ? (
                    <button
                      className="unblock-btn"
                      onClick={() => unblockUser(user.id)}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="block-btn"
                      onClick={() => blockUser(user.id)}
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPanel;