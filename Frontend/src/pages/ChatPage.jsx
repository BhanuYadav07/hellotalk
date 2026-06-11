import Sidebar from "../components/sidebar/Sidebar";
import ChatView from "../components/chat/ChatView";
import ProfilePanel from "../components/profile/ProfilePanel";
import Logo from "../components/common/Logo";

import { useApp } from "../contexts/AppContext";
function ChatPage() {
  const { currentFriend } = useApp();
  return (
    <div className="app">
      <Sidebar/>
      <main className="main">
        {!currentFriend ? (
          <div className="welcome-state">
            <Logo size={64}/>
            <h2>Hello, {JSON.parse(localStorage.getItem("user") || "{}").firstName || "there"}</h2>
            <p>Select a friend to start chatting, or use the search bar to find someone new.</p>
          </div>
        ) : <ChatView/>}
      </main>
      <ProfilePanel/>
    </div>
  );
}
export default ChatPage;