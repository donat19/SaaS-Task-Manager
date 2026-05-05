import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: isAdmin ? 'oklch(0.96 0.025 280)' : 'var(--bg-soft)',
      color: isAdmin ? 'var(--accent-ink)' : 'var(--ink-3)',
      border: `1px solid ${isAdmin ? 'var(--accent)' : 'var(--line)'}`,
    }}>
      {isAdmin ? '★ Admin' : 'Member'}
    </span>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        style={{ background: 'var(--bg-elev)', borderRadius: 12, padding: '24px 28px', width: 340, boxShadow: '0 8px 32px #0003', display: 'flex', flexDirection: 'column', gap: 16 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="trash" size={16} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Remove member?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{message}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }} onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  )
}

export default function Members() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteData, setInviteData] = useState({ name: '', email: '', password: '', role: 'user' })
  const [inviteError, setInviteError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState(null)
  const [inviteLink, setInviteLink] = useState(null)
  const [generatingLink, setGeneratingLink] = useState(false)

  useEffect(() => {
    api.get('/users').then(u => { setUsers(u); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const generateInviteLink = async () => {
    setGeneratingLink(true)
    try {
      const { token } = await api.post('/auth/invite')
      const link = `${window.location.origin}/register?invite=${token}`
      setInviteLink(link)
    } catch {}
    setGeneratingLink(false)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    showToast('Invite link copied!')
  }

  const changeRole = async (id, role) => {
    try {
      const updated = await api.patch(`/users/${id}/role`, { role })
      setUsers(us => us.map(u => u.id === id ? { ...u, role: updated.role } : u))
      showToast(`Role updated to ${role}`)
    } catch {}
  }

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      setUsers(us => us.filter(u => u.id !== id))
      setConfirmId(null)
      showToast('Member removed')
    } catch {}
  }

  const invite = async () => {
    if (!inviteData.name.trim() || !inviteData.email.trim() || !inviteData.password.trim()) {
      setInviteError('All fields are required'); return
    }
    setInviting(true); setInviteError('')
    try {
      const newUser = await api.post('/auth/register', inviteData)
      // register returns token, refetch users
      const updated = await api.get('/users')
      setUsers(updated)
      setInviteOpen(false)
      setInviteData({ name: '', email: '', password: '', role: 'user' })
      showToast(`${inviteData.name} added to workspace`)
    } catch (e) {
      setInviteError(e?.response?.data?.error || 'Failed to create account')
    }
    setInviting(false)
  }

  const confirmUser = users.find(u => u.id === confirmId)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Members</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
            {users.length} {users.length === 1 ? 'person' : 'people'} in this workspace
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={generateInviteLink} disabled={generatingLink}>
            <Icon name="link" /> {generatingLink ? 'Generating…' : 'Invite link'}
          </button>
          <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
            <Icon name="plus" /> Add member
          </button>
        </div>
      </div>

      {/* Invite link banner */}
      {inviteLink && (
        <div style={{
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="link" style={{ width: 15, height: 15, color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-ink)', marginBottom: 3 }}>
              Invite link · expires in 48 hours
            </div>
            <div style={{
              fontSize: 11.5, fontFamily: 'var(--mono)', color: 'var(--ink-3)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{inviteLink}</div>
          </div>
          <button className="btn btn-ghost" onClick={copyInviteLink} style={{ flexShrink: 0, fontSize: 12 }}>
            <Icon name="paperclip" /> Copy
          </button>
          <button className="icbtn" onClick={() => setInviteLink(null)}>
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>Loading…</div>
      ) : (
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 200px 140px 120px 80px',
            padding: '10px 20px', borderBottom: '1px solid var(--line)',
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-4)',
          }}>
            <span>Member</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span />
          </div>

          {users.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 200px 140px 120px 80px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < users.length - 1 ? '1px solid var(--line-soft)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar user={u} size={34} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 550, color: 'var(--ink)' }}>
                    {u.name}
                    {u.id === me?.id && (
                      <span style={{ marginLeft: 7, fontSize: 10.5, color: 'var(--ink-4)', fontWeight: 400 }}>you</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{u.email}</div>

              {/* Role selector */}
              <div>
                {u.id === me?.id ? (
                  <RoleBadge role={u.role} />
                ) : (
                  <select
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                    style={{
                      all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: '1px solid',
                      borderColor: u.role === 'admin' ? 'var(--accent)' : 'var(--line)',
                      background: u.role === 'admin' ? 'var(--accent-soft)' : 'var(--bg-soft)',
                      color: u.role === 'admin' ? 'var(--accent-ink)' : 'var(--ink-3)',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="user">Member</option>
                    <option value="admin">★ Admin</option>
                  </select>
                )}
              </div>

              {/* Joined date */}
              <div style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>
                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {u.id !== me?.id && (
                  <button
                    className="icbtn"
                    title="Remove member"
                    onClick={() => setConfirmId(u.id)}
                    style={{ color: 'var(--ink-4)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <div className="scrim" onClick={() => setInviteOpen(false)}>
          <div
            style={{ background: 'var(--bg-elev)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px #0003', overflow: 'hidden', animation: 'slideUp 0.22s cubic-bezier(0.2,0.8,0.2,1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 650, color: 'var(--ink)', flex: 1 }}>Add member</span>
              <button className="icbtn" onClick={() => setInviteOpen(false)}><Icon name="x" /></button>
            </div>
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'name', label: 'Full name', placeholder: 'Alice Chen', type: 'text' },
                { key: 'email', label: 'Email', placeholder: 'alice@company.com', type: 'email' },
                { key: 'password', label: 'Temporary password', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <div className="m-side-h" style={{ marginBottom: 5 }}>{f.label}</div>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={inviteData[f.key]}
                    onChange={e => setInviteData(d => ({ ...d, [f.key]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') invite() }}
                    style={{
                      all: 'unset', display: 'block', width: '100%', boxSizing: 'border-box',
                      padding: '8px 11px', fontSize: 13, color: 'var(--ink)',
                      background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}
              <div>
                <div className="m-side-h" style={{ marginBottom: 5 }}>Role</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['user', 'admin'].map(r => (
                    <button
                      key={r}
                      onClick={() => setInviteData(d => ({ ...d, role: r }))}
                      style={{
                        all: 'unset', cursor: 'pointer', padding: '6px 16px', borderRadius: 8,
                        fontSize: 12.5, border: '1px solid', fontFamily: 'inherit', fontWeight: 500,
                        borderColor: inviteData.role === r ? 'var(--accent)' : 'var(--line)',
                        background: inviteData.role === r ? 'var(--accent-soft)' : 'var(--bg-soft)',
                        color: inviteData.role === r ? 'var(--accent-ink)' : 'var(--ink-2)',
                      }}
                    >
                      {r === 'admin' ? '★ Admin' : 'Member'}
                    </button>
                  ))}
                </div>
              </div>
              {inviteError && (
                <div style={{ fontSize: 12, color: '#ef4444', background: '#fee2e2', padding: '6px 10px', borderRadius: 7 }}>{inviteError}</div>
              )}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setInviteOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={invite} disabled={inviting}>{inviting ? 'Adding…' : 'Add member'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmId && (
        <ConfirmDialog
          message={`${confirmUser?.name} will lose access to this workspace.`}
          onConfirm={() => deleteUser(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast"><Icon name="check" /> {toast}</div>
        </div>
      )}
    </div>
  )
}
