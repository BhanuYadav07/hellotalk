
import { useApp } from "../../contexts/AppContext";
function ProfilePanel() {
  const { profilePanel, setProfilePanel, currentFriend, setScreen, toast, deleteFriend, handleLogout } = useApp();
  if (!profilePanel) return null;
  const close = () => setProfilePanel(null);
 
  if (profilePanel === "own") {
    const me = JSON.parse(localStorage.getItem("user") || "{}");
    const initials = ((me.firstName?.[0] || "") + (me.lastName?.[0] || "")).toUpperCase() || "?";
    const fullName = `${me.firstName || ""} ${me.lastName || ""}`.trim() || "Unknown";

    return (
      <div className="profile-panel" style={{display:"flex"}}>
        <div className="panel-header"><span>My Profile</span><button className="icon-btn" onClick={close}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
        <div className="panel-body">
          <div className="profile-avatar-section">
            <div className="profile-avatar-big" style={{background:"#2bab8c20",color:"var(--accent)"}}>{initials}</div>
            <div><div className="profile-name" style={{textAlign:"center"}}>{fullName}</div><div className="profile-username" style={{textAlign:"center"}}>@{me.username || ""}</div></div>
          </div>
          <div>
            <div className="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>{fullName}</span></div>
            <div className="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style={{color:"var(--text-muted)"}}>@{me.username || ""}</span></div>
            <div className="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>{me.email || ""}</span></div>
          </div>
          <button className="panel-action-btn" onClick={() => toast("Photo upload coming soon!")}>Change Profile Photo</button>
          <button className="panel-action-btn danger" onClick={() => { handleLogout(); close(); }}>Logout</button>
        </div>
      </div>
    );
  }
 
  if (profilePanel === "friend" && currentFriend) {
    const f = currentFriend;
    return (
      <div className="profile-panel" style={{display:"flex"}}>
        <div className="panel-header"><span>{f.name}</span><button className="icon-btn" onClick={close}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
        <div className="panel-body">
          <div className="profile-avatar-section">
            <div className="profile-avatar-big" style={{background:f.color,color:f.tc}}>{f.initials}</div>
            <div><div className="profile-name" style={{textAlign:"center"}}>{f.name}</div><div className="profile-username" style={{textAlign:"center"}}>{f.username}</div></div>
          </div>
          <div>
            <div className="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>{f.name}</span><button className="edit-link" onClick={() => toast("Comming soon!")}>Change Name</button></div>
            <div className="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style={{color:"var(--text-muted)"}}>{f.username}</span></div>
          </div>
          <button className="panel-action-btn danger" onClick={() => deleteFriend(f.id)}>Delete Friend</button>
        </div>
      </div>
    );
  }
  return null;
}
 export default ProfilePanel;