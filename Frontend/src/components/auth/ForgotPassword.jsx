import { useState } from "react";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import { authService } from "../../services/authService";

function ForgotPassword() {
  const { setScreen, toast, setPendingEmail, setPendingOtpType } = useApp();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function sendOtp() {
    if (!username || !email) {
      toast("Please enter username and email");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(username, email);
      setPendingEmail(email);
      setPendingOtpType("FORGOT");
      setScreen("otp");
      toast("OTP sent to " + email);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <Logo size={40}/>
        <span>Hello <em>Talk</em></span>
      </div>
      <h1 className="auth-title">Reset password</h1>
      <p className="auth-subtitle">
        Enter your username and email. We'll send an OTP to verify.
      </p>

      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          className="form-input"
          type="text"
          placeholder="@yourusername"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="form-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={sendOtp} disabled={loading}>
        {loading ? "Sending OTP..." : "Send OTP →"}
      </button>

      <div className="auth-switch">
        <a onClick={() => setScreen("login")}>← Back to login</a>
      </div>
    </div>
  );
}

export default ForgotPassword;