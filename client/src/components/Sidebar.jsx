import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ view, setView, onShortcuts, onSearch }) {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const footRef = useRef(null)

  useEffect(() => {
    if (!profileOpen) return
    const close = (e) => { if (!footRef.current?.contains(e.target)) setProfileOpen(false) }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [profileOpen])

  const boards = [
    { id: 'board', label: 'Product team', color: 'oklch(0.6 0.14 280)', active: view === 'board' || view === 'table' },
  ]

  const admin = user?.role === 'admin' ? [
    { id: 'members',   label: 'Members',   icon: 'user' },
    { id: 'analytics', label: 'Analytics', icon: 'activity' },
    { id: 'audit',     label: 'Audit log', icon: 'log' },
  ] : [
    { id: 'analytics', label: 'Analytics', icon: 'activity' },
  ]

  const menuItem = (icon, label, onClick, danger) => (
    <button
      onClick={onClick}
      style={{
        all: 'unset', display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', padding: '8px 12px', fontSize: 13, cursor: 'pointer',
        color: danger ? '#ef4444' : 'var(--ink-2)', borderRadius: 7,
        fontFamily: 'inherit', boxSizing: 'border-box',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fee2e2' : 'var(--bg-soft)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon name={icon} style={{ width: 14, height: 14, flexShrink: 0 }} />
      {label}
    </button>
  )

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark" />
        <div className="sb-name">Strat<em>a</em></div>
      </div>

      <div className="sb-search" onClick={onSearch} style={{ cursor: 'pointer' }}>
        <div className="sb-search-in">
          <Icon name="search" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </div>
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
      </div>

      {/* Footer with profile popup */}
      <div ref={footRef} style={{ position: 'relative', marginTop: 'auto', flexShrink: 0 }}>
        {profileOpen && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 8, right: 8,
            background: 'var(--bg-elev)', border: '1px solid var(--line)',
            borderRadius: 10, boxShadow: '0 -4px 24px #0002',
            padding: 6, zIndex: 50,
            animation: 'slideUp 0.15s cubic-bezier(0.2,0.8,0.2,1)',
          }}>
            {/* User info header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px 10px', borderBottom: '1px solid var(--line-soft)', marginBottom: 4,
            }}>
              <Avatar user={user} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>{user?.email}</div>
              </div>
            </div>

            {menuItem('user', 'Profile', () => { setProfileOpen(false); setView('profile') })}
            {menuItem('settings', 'Settings', () => { setProfileOpen(false); setView('settings') })}
            {menuItem('cmd', 'Shortcuts', () => { setProfileOpen(false); onShortcuts() })}
            <div style={{ height: 1, background: 'var(--line-soft)', margin: '4px 4px' }} />
            {menuItem('logout', 'Sign out', () => { setProfileOpen(false); logout() }, true)}
          </div>
        )}

        <div
          className="sb-foot"
          onClick={() => setProfileOpen(o => !o)}
          style={{ cursor: 'pointer' }}
        >
          <Avatar user={user} size={28} />
          <div className="sb-me">
            <div className="sb-me-name">{user?.name}</div>
            <div className="sb-me-role">{user?.role}@strata</div>
          </div>
          <Icon
            name="chev"
            style={{
              color: 'var(--ink-4)', width: 13, height: 13,
              transform: profileOpen ? 'rotate(270deg)' : 'rotate(90deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>
    </aside>
  )
}
