// Notifications dropdown

const NotificationsPop = ({ notifs, onClose, onClick, markAllRead }) => {
  const { USERS } = window.STRATA_DATA;
  React.useEffect(() => {
    const handler = (e) => { if (!e.target.closest(".pop") && !e.target.closest("[data-notif-btn]")) onClose(); };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [onClose]);
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
      if (p.startsWith("*") && p.endsWith("*")) return <em key={i} style={{ fontFamily: "var(--serif)", color: "var(--accent)", fontStyle: "italic" }}>{p.slice(1, -1)}</em>;
      return <span key={i}>{p}</span>;
    });
  };
  return (
    <div className="pop">
      <div className="pop-h"><b>Notifications</b><a onClick={markAllRead}>Mark all read</a></div>
      <div className="pop-list">
        {notifs.map(n => {
          const u = USERS.find(x => x.id === n.user);
          return (
            <div key={n.id} className={`pop-item ${n.unread ? "unread" : ""}`} onClick={() => onClick(n.taskId, n.id)}>
              <Avatar user={u} size={28} />
              <div className="pop-item-body">
                <div>{renderText(n.text)}</div>
                <time>{n.at}</time>
              </div>
              <div className="pop-item-dot" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.NotificationsPop = NotificationsPop;
