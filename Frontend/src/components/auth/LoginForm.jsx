import { useState } from "react";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import { authService } from "../../services/authService";

function LoginForm() {
  const { setScreen, toast, connectSocket } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  async function doLogin() {
  if (!username || !password) {
    toast("Please enter username and password");
    return;
  }

  setLoading(true);

  try {
    const data = await authService.login(username, password);

    connectSocket();

    const user = data.user;

    if (user?.role === "ADMIN") {
      setScreen("admin");
      toast("Admin logged in successfully!");
    } else {
      setScreen("main");
      toast("Logged in successfully!");
    }

  } catch (err) {
    toast(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
}

  function handleKey(e) {
    if (e.key === "Enter") doLogin();
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <Logo size={40}/>
        <span>Hello <em>Talk</em></span>
      </div>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Log in to your Hello Talk account.</p>

      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          className="form-input"
          type="text"
          placeholder="@username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>

      <button className="btn-primary" onClick={doLogin} disabled={loading}>
        {loading ? "Logging in..." : "Log In →"}
      </button>

      <div className="divider">or</div>

      <div className="auth-switch" style={{marginTop:0}}>
        <a onClick={() => setScreen("forgot")}>Forgot password?</a>
      </div>
      <div className="auth-switch">
        No account? <a onClick={() => setScreen("signup")}>Sign up</a>
      </div>
    </div>
  );
}

export default LoginForm;