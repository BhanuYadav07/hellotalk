
import { useApp } from "../../contexts/AppContext";

function FriendItem({ friend }) {
  const { openChat, currentFriend } = useApp();
  const isActive = currentFriend?.id === friend.id;
  const lastMsg = friend.msgs.length ? friend.msgs[friend.msgs.length - 1].text : "No messages yet";
  const lastTime = friend.msgs.length ? friend.msgs[friend.msgs.length - 1].time : "";
  // Only online dot — no section labels
  const dotClass = friend.status === "online" ? "dot-online" : "dot-offline";
  return (
    <div className={`friend-item${isActive ? " active" : ""}`} onClick={() => openChat(friend)}>
      <div className="avatar">
        <div className="avatar-img" style={{background:friend.color, color:friend.tc}}>{friend.initials}</div>
        <div className={`avatar-dot ${dotClass}`}/>
      </div>
      <div className="friend-info">
        <div className="friend-name">{friend.name}{friend.isNew && <span className="new-tag"> new</span>}</div>
        <div className="friend-last">{lastMsg}</div>
      </div>
      <div className="friend-meta">
        <div className="friend-time">{lastTime}</div>
        {friend.unread > 0 && <div className="badge">{friend.unread}</div>}
      </div>
    </div>
  );
}
export default FriendItem;