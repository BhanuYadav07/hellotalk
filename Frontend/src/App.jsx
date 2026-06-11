import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import Toast from "./components/common/Toast";
import { useApp } from "./contexts/AppContext";
function App() {
  const { screen } = useApp();
  switch(screen) {
    case "login":
      return <>
        <LoginPage />
        <Toast />
      </>;
    case "signup":
      return <>
        <SignupPage />
        <Toast />
      </>;
    case "otp":
      return <>
        <OtpPage />
        <Toast />
      </>;
    case "forgot":
      return <>
        <ForgotPasswordPage />
        <Toast />
      </>;
    case "admin":
      return <>
        <AdminPage />
        <Toast />
      </>;
    default:
      return <>
        <ChatPage /><Toast /></>;
  }
}
export default App;