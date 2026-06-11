import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
// Load messages when chat opens — add useEffect:


function ChatView() {
  const { currentFriend, sendMessage, setProfilePanel, toast } = useApp();
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);
 
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [currentFriend?.msgs?.length]);
 
  if (!currentFriend) return null;
  const f = currentFriend;
  const dotClass = f.status === "online" ? "dot-online":"dot-offline";
 
  function handleSend() { sendMessage(input); setInput(""); }
  function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }
 
  return (
    <div style={{display:"flex", flexDirection:"column", flex:1, minHeight:0, overflow:"hidden"}}>
      <div className="chat-topbar">
        <div className="avatar">
          <div className="avatar-img" style={{background:f.color,color:f.tc,cursor:"pointer"}} onClick={() => setProfilePanel("friend")}>{f.initials}</div>
          <div className={`avatar-dot ${dotClass}`}/>
        </div>
        <div className="chat-peer-info">
          <div className="chat-peer-name">{f.name}</div>
        </div>
        <div className="chat-topbar-actions">
          <button className="icon-btn" onClick={() => setProfilePanel("friend")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
        </div>
      </div>
      <div className="chat-body" ref={bodyRef}>
        {f.msgs.length === 0 ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:"var(--text-muted)",fontSize:13}}>
            <span style={{fontSize:36}}>👋</span><span>Say hello to {f.name}!</span>
          </div>
        ) : (
          <>
            <div className="date-sep">Today</div>
            {f.msgs.map((m, i) => {
              const prevSameDir = i > 0 && f.msgs[i-1].out === m.out;
              return (
                <div key={i}>
                  <div className={`msg-row ${m.out ? "out" : "in"}`}>
                    {!m.out && !prevSameDir && <div className="msg-avatar avatar"><div className="avatar-img" style={{background:f.color,color:f.tc}}>{f.initials}</div></div>}
                    {!m.out && prevSameDir && <div className="msg-avatar"/>}
                    <div className={`msg-bubble ${m.out ? "out" : "in"}`}>{m.text}</div>
                  </div>
                  {m.time && <div className={`msg-time ${m.out ? "out" : "in"}`}>{m.time}</div>}
                </div>
              );
            })}
          </>
        )}
      </div>
      <div className="chat-input-bar">
        <button className="icon-btn" onClick={() => toast("Attach file — coming soon!")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <div className="chat-input-wrap">
          <textarea className="chat-input" rows={1} placeholder="Type a message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}/>
        </div>
        <button className="send-btn" onClick={handleSend}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
export default ChatView;