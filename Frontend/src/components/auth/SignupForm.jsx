import { useState } from "react";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import { authService } from "../../services/authService";

function SignupForm() {
  const { setScreen, toast, setPendingEmail } = useApp();

  const [fname, setFname]   = useState("");
  const [lname, setLname]   = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [pass2, setPass2]   = useState("");
  const [loading, setLoading] = useState(false);

  async function goOtp() {
    if (!fname || !username || !email || !pass) {
      toast("Please fill all required fields");
      return;
    }
    if (pass !== pass2) {
      toast("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authService.signup({
        firstName: fname,
        lastName: lname,
        username,
        email,
        password: pass,
      });
      setPendingEmail(email);
      setScreen("otp");
      toast("OTP sent to " + email);
    } catch (err) {
      toast(err.response?.data?.message || "Signup failed");
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
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Join Hello Talk and start messaging your friends instantly.</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-input" type="text" placeholder="Tarun"
            value={fname} onChange={e => setFname(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Last Name <span style={{color:"var(--text-muted)",fontWeight:400}}>(opt)</span></label>
          <input className="form-input" type="text" placeholder="Yadav"
            value={lname} onChange={e => setLname(e.target.value)}/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Username</label>
        <input className="form-input" type="text" placeholder="@yourusername"
          value={username} onChange={e => setUsername(e.target.value)}/>
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" placeholder="mail@example.com"
          value={email} onChange={e => setEmail(e.target.value)}/>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={pass} onChange={e => setPass(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Re-enter</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={pass2} onChange={e => setPass2(e.target.value)}/>
        </div>
      </div>

      <button className="btn-primary" onClick={goOtp} disabled={loading}>
        {loading ? "Sending OTP..." : "Send OTP & Verify →"}
      </button>

      <div className="auth-switch">
        Already have an account? <a onClick={() => setScreen("login")}>Log in</a>
      </div>
    </div>
  );
}

export default SignupForm;