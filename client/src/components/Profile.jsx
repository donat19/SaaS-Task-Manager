import { useState, useRef } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>
        {title}
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="m-side-h" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

const input = {
  all: 'unset', display: 'block', width: '100%', boxSizing: 'border-box',
  padding: '8px 12px', fontSize: 13, color: 'var(--ink)',
  background: 'var(--bg-soft)', border: '1px solid var(--line)',
  borderRadius: 8, fontFamily: 'inherit',
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState(null)

  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState(null)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef(null)

  const msg = (setter, text, isError) => {
    setter({ text, isError })
    setTimeout(() => setter(null), 3000)
  }

  const saveName = async () => {
    if (!name.trim() || name === user?.name) return
    setSavingName(true)
    try {
      const updated = await api.patch(`/users/${user.id}`, { name: name.trim() })
      setUser(updated)
      msg(setNameMsg, 'Name updated', false)
    } catch (e) {
      msg(setNameMsg, e?.response?.data?.error || 'Failed to update', true)
    }
    setSavingName(false)
  }

  const savePassword = async () => {
    if (newPass !== confirmPass) { msg(setPassMsg, 'Passwords do not match', true); return }
    if (newPass.length < 6) { msg(setPassMsg, 'Password must be at least 6 characters', true); return }
    setSavingPass(true)
    try {
      await api.patch(`/users/${user.id}/password`, { current: curPass, next: newPass })
      setCurPass(''); setNewPass(''); setConfirmPass('')
      msg(setPassMsg, 'Password changed', false)
    } catch (e) {
      msg(setPassMsg, e?.response?.data?.error || 'Failed to change password', true)
    }
    setSavingPass(false)
  }

  const uploadAvatar = async (file) => {
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const updated = await api.post('/attachments/avatar', form)
      setUser(updated)
    } catch {}
    setUploadingAvatar(false)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 640, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px' }}>Profile</h1>

      {/* Avatar */}
      <Section title="Avatar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <Avatar user={user} size={72} />
            {uploadingAvatar && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}>
                <Icon name="upload" style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}>
              <Icon name="upload" /> {uploadingAvatar ? 'Uploading…' : 'Upload photo'}
            </button>
            <p style={{ fontSize: 11.5, color: 'var(--ink-4)', margin: '6px 0 0' }}>JPG, PNG or GIF. Max 2MB.</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadAvatar(e.target.files[0])} />
          </div>
        </div>
      </Section>

      {/* Name */}
      <Section title="Personal info">
        <Field label="Full name">
          <input style={input} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName() }} />
        </Field>
        <Field label="Email">
          <input style={{ ...input, color: 'var(--ink-3)', cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
          <p style={{ fontSize: 11.5, color: 'var(--ink-4)', margin: '5px 0 0' }}>Email cannot be changed.</p>
        </Field>
        <Field label="Role">
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: user?.role === 'admin' ? 'var(--accent-soft)' : 'var(--bg-soft)', color: user?.role === 'admin' ? 'var(--accent-ink)' : 'var(--ink-3)', border: '1px solid var(--line)' }}>
            {user?.role === 'admin' ? '★ Admin' : 'Member'}
          </div>
        </Field>
        {nameMsg && (
          <div style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, marginBottom: 12, background: nameMsg.isError ? '#fee2e2' : '#dcfce7', color: nameMsg.isError ? '#ef4444' : '#16a34a' }}>
            {nameMsg.text}
          </div>
        )}
        <button className="btn btn-primary" onClick={saveName} disabled={savingName || !name.trim() || name === user?.name}>
          {savingName ? 'Saving…' : 'Save changes'}
        </button>
      </Section>

      {/* Password */}
      <Section title="Change password">
        <Field label="Current password">
          <input style={input} type="password" placeholder="••••••••" value={curPass} onChange={e => setCurPass(e.target.value)} />
        </Field>
        <Field label="New password">
          <input style={input} type="password" placeholder="Min. 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <input style={input} type="password" placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') savePassword() }} />
        </Field>
        {passMsg && (
          <div style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, marginBottom: 12, background: passMsg.isError ? '#fee2e2' : '#dcfce7', color: passMsg.isError ? '#ef4444' : '#16a34a' }}>
            {passMsg.text}
          </div>
        )}
        <button className="btn btn-primary" onClick={savePassword} disabled={savingPass || !curPass || !newPass || !confirmPass}>
          {savingPass ? 'Saving…' : 'Change password'}
        </button>
      </Section>

      {/* Danger zone */}
      <Section title="Account">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 550, color: 'var(--ink)' }}>Member since</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
