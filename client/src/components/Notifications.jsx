import { useEffect } from 'react'
import { Avatar } from './Atoms'

function renderText(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <b key={i}>{p.slice(2, -2)}</b>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i} style={{ fontFamily: 'var(--serif)', color: 'var(--accent)', fontStyle: 'italic' }}>{p.slice(1, -1)}</em>
    return <span key={i}>{p}</span>
  })
}

export default function NotificationsPop({ notifs, onClose, onClick, markAllRead }) {
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.pop') && !e.target.closest('[data-notif-btn]')) onClose()
    }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [onClose])

  return (
    <div className="pop">
      <div className="pop-h">
        <b>Notifications</b>
        <a onClick={markAllRead} style={{ cursor: 'pointer' }}>Mark all read</a>
      </div>
      <div className="pop-list">
        {notifs.length === 0 && (
          <div style={{ padding: '20px 16px', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>No notifications</div>
        )}
        {notifs.map(n => (
          <div key={n.id} className={`pop-item ${!n.read ? 'unread' : ''}`} onClick={() => onClick(n.taskId, n.id)}>
            <div className="pop-item-body">
              <div>{renderText(n.text)}</div>
              <time>{new Date(n.createdAt).toLocaleString()}</time>
            </div>
            {!n.read && <div className="pop-item-dot" />}
          </div>
        ))}
      </div>
    </div>
  )
}
