import { useRef, useState } from "react";
import Logo from "../common/Logo";
import { useApp } from "../../contexts/AppContext";
import { authService } from "../../services/authService";

function OtpVerification() {
  const { setScreen, toast, pendingEmail, pendingOtpType, connectSocket } = useApp();
  const inputs = useRef([]);
  const [loading, setLoading] = useState(false);

  function otpNext(index) {
    if (inputs.current[index]?.value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  async function verifyOtp() {
    const code = inputs.current.map(i => i?.value || "").join("");
    if (code.length < 6) {
      toast("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      if (pendingOtpType === "FORGOT") {
    await authService.verifyOtp(pendingEmail, code, "FORGOT");
    setScreen("login");
    toast("OTP verified. Please login again.");

      } else {
        await authService.verifyOtp(pendingEmail, code, "SIGNUP");
        connectSocket();
        setScreen("main");
        toast("Welcome to HelloTalk! 🎉");
      }
    } catch (err) {
      toast(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    try {
      await authService.resendOtp(pendingEmail, pendingOtpType);
      toast("OTP resent to " + pendingEmail);
    } catch (err) {
      toast("Failed to resend OTP");
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <Logo size={40}/>
        <span>Hello <em>Talk</em></span>
      </div>
      <h1 className="auth-title">Check your email</h1>
      <p className="auth-subtitle">
        We've sent a 6-digit code to{" "}
        <strong style={{color:"var(--text-primary)"}}>
          {pendingEmail || "your email"}
        </strong>. Enter it below.
      </p>
      <p className="otp-hint">Enter verification code</p>

      <div className="otp-group">
        {[0,1,2,3,4,5].map(i => (
          <input
            key={i}
            className="otp-input"
            maxLength={1}
            ref={el => inputs.current[i] = el}
            onInput={() => otpNext(i)}
          />
        ))}
      </div>

      <button className="btn-primary" onClick={verifyOtp} disabled={loading}>
        {loading ? "Verifying..." : "Verify & Continue →"}
      </button>

      <div className="auth-switch">
        Didn't receive? <a onClick={resendOtp}>Resend code</a>
      </div>
    </div>
  );
}

export default OtpVerification;