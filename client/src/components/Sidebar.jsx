import Icon from './Icon'
import { Avatar } from './Atoms'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ view, setView, onShortcuts }) {
  const { user, logout } = useAuth()

  const items = [
    { id: 'inbox',  label: 'Inbox',   icon: 'inbox' },
    { id: 'myweek', label: 'My week', icon: 'cal' },
    { id: 'starred',label: 'Starred', icon: 'star' },
  ]

  const boards = [
    { id: 'board', label: 'Product team', color: 'oklch(0.6 0.14 280)', active: view === 'board' || view === 'table' },
  ]

  const admin = user?.role === 'admin' ? [
    { id: 'audit',   label: 'Audit log', icon: 'log' },
    { id: 'members', label: 'Members',   icon: 'user' },
    { id: 'settings',label: 'Workspace', icon: 'settings' },
  ] : []

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark" />
        <div className="sb-name">Strat<em>a</em></div>
      </div>

      <div className="sb-search">
        <div className="sb-search-in">
          <Icon name="search" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </div>
      </div>

      <div className="sb-list">
        {items.map(it => (
          <div key={it.id} className={`sb-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>

      <div className="sb-sect">
        <span>Boards</span>
        <button title="New board"><Icon name="plus" size={12} /></button>
      </div>
      <div className="sb-list">
        {boards.map(b => (
          <div key={b.id} className={`sb-item ${b.active ? 'active' : ''}`} onClick={() => setView('board')}>
            <span className="sb-dot" style={{ background: b.color }} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      {admin.length > 0 && (
        <>
          <div className="sb-sect"><span>Admin</span></div>
          <div className="sb-list">
            {admin.map(it => (
              <div key={it.id} className={`sb-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
                <Icon name={it.icon} />
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sb-list" style={{ marginTop: 4 }}>
        <div className="sb-item" onClick={onShortcuts}>
          <Icon name="cmd" />
          <span>Shortcuts</span>
          <span className="count" style={{ fontFamily: 'var(--mono)' }}>⌘/</span>
        </div>
        <div className="sb-item" onClick={logout} style={{ color: 'var(--ink-3)' }}>
          <Icon name="logout" />
          <span>Sign out</span>
        </div>
      </div>

      <div className="sb-foot">
        <Avatar user={user} size={28} />
        <div className="sb-me">
          <div className="sb-me-name">{user?.name}</div>
          <div className="sb-me-role">{user?.role}@strata</div>
        </div>
        <Icon name="chev" style={{ color: 'var(--ink-4)', transform: 'rotate(90deg)', width: 13, height: 13 }} />
      </div>
    </aside>
  )
}
