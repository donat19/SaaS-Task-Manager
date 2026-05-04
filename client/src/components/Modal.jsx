import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { Avatar, Tag, StatusPill, PriorityPill, COLUMNS } from './Atoms'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function TaskModal({ taskId, onClose, onUpdate, dark }) {
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [draft, setDraft] = useState('')
  const [dropOver, setDropOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [moreOpen, setMoreOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!taskId) return
    setLoading(true)
    Promise.all([
      api.get(`/tasks/${taskId}`),
      api.get(`/comments/task/${taskId}`),
      api.get(`/attachments/task/${taskId}`),
    ]).then(([t, c, a]) => {
      setTask(t)
      setComments(c)
      setAttachments(a)
    }).finally(() => setLoading(false))
  }, [taskId])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { if (moreOpen) setMoreOpen(false); else onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, moreOpen])

  useEffect(() => {
    if (!moreOpen) return
    const close = () => setMoreOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [moreOpen])

  const submitComment = async () => {
    if (!draft.trim()) return
    const c = await api.post(`/comments/task/${taskId}`, { text: draft.trim() })
    setComments(cs => [...cs, c])
    setDraft('')
  }

  const deleteComment = async (id) => {
    await api.delete(`/comments/${id}`)
    setComments(cs => cs.filter(c => c.id !== id))
  }

  const handleDelete = async () => {
    setDeleting(true)
    setConfirmDelete(false)
    try {
      await api.delete(`/tasks/${taskId}`)
      onClose()
    } catch {
      setDeleting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?task=${taskId}`)
    setMoreOpen(false)
  }

  const handleStatusChange = async (status) => {
    const updated = await api.patch(`/tasks/${taskId}`, { status })
    setTask(updated)
    onUpdate(updated)
  }

  const uploadFiles = async (files) => {
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      const att = await api.post(`/attachments/task/${taskId}`, form)
      setAttachments(as => [...as, att])
    }
  }

  const deleteAttachment = async (id) => {
    await api.delete(`/attachments/${id}`)
    setAttachments(as => as.filter(a => a.id !== id))
  }

  if (!taskId) return null

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>Loading…</div>
        ) : task ? (
          <>
            <div className="m-main">
              <div className="m-head">
                <span className="id">STR-{task.id}</span>
                <StatusPill status={task.status} dark={dark} />
                <PriorityPill priority={task.priority} />
                <div className="m-head-spacer" />
                <div style={{ position: 'relative' }}>
                  <button className="icbtn" title="More" onClick={() => setMoreOpen(o => !o)}><Icon name="more" /></button>
                  {moreOpen && (
                    <div
                      style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 100,
                        background: 'var(--bg-elev)', border: '1px solid var(--line)',
                        borderRadius: 8, boxShadow: '0 4px 16px #0002', padding: 4,
                        minWidth: 160, marginTop: 4,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={copyLink}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', fontSize: 13, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--ink)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover, #f5f5f5)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Icon name="link" size={13} /> Copy link
                      </button>
                      <button
                        onClick={() => { setMoreOpen(false); setConfirmDelete(true) }}
                        disabled={deleting}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', fontSize: 13, background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--red, #e55)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover, #f5f5f5)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Icon name="trash" size={13} /> {deleting ? 'Deleting…' : 'Delete task'}
                      </button>
                    </div>
                  )}
                </div>
                <button className="icbtn" title="Close" onClick={onClose}><Icon name="x" /></button>
              </div>

              <h1 className="m-title">{task.title}</h1>

              <div className="m-desc-h">Description</div>
              <div className="m-desc">
                {task.description
                  ? <p>{task.description}</p>
                  : <p style={{ color: 'var(--ink-4)' }}>No description.</p>}
              </div>

              <div className="m-cmts">
                <div className="m-side-h" style={{ marginBottom: 4 }}>
                  Activity · {comments.length} comments
                </div>
                {comments.map(c => (
                  <div className="m-cmt" key={c.id}>
                    <Avatar user={c.user} size={28} />
                    <div className="m-cmt-body">
                      <div className="m-cmt-h">
                        <b>{c.user.name}</b>
                        <time>{new Date(c.createdAt).toLocaleString()}</time>
                        {(c.userId === user?.id || user?.role === 'admin') && (
                          <button className="icbtn" style={{ marginLeft: 'auto', opacity: 0.5 }}
                            onClick={() => deleteComment(c.id)}><Icon name="x" size={11} /></button>
                        )}
                      </div>
                      <div className="m-cmt-text">{c.text}</div>
                    </div>
                  </div>
                ))}
                <div className="m-cmt-form">
                  <Avatar user={user} size={28} />
                  <textarea
                    placeholder="Write a comment… ⌘⏎ to send"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment() }}
                  />
                </div>
                {draft && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button className="btn btn-ghost" onClick={() => setDraft('')}>Cancel</button>
                    <button className="btn btn-primary" onClick={submitComment}>Comment</button>
                  </div>
                )}
              </div>
            </div>

            <div className="m-side">
              <div>
                <div className="m-side-h">Properties</div>
                <div className="m-meta-row">
                  <span className="m-meta-lbl"><Icon name="user" /> Assignees</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {task.assignees?.map(a => <Avatar key={a.userId} user={a.user} size={22} />)}
                  </div>
                </div>
                <div className="m-meta-row">
                  <span className="m-meta-lbl"><Icon name="layers" /> Status</span>
                  <select
                    className="twk-field"
                    style={{ height: 26, fontSize: 12, background: 'var(--bg-elev)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 6 }}
                    value={task.status}
                    onChange={e => handleStatusChange(e.target.value)}
                  >
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="m-meta-row">
                  <span className="m-meta-lbl"><Icon name="flag" /> Priority</span>
                  <PriorityPill priority={task.priority} />
                </div>
                <div className="m-meta-row">
                  <span className="m-meta-lbl"><Icon name="cal" /> Due</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="m-meta-row">
                  <span className="m-meta-lbl"><Icon name="grid" /> Tags</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {task.tags?.map(tt => <Tag key={tt.tagId} tag={tt.tag} dark={dark} />)}
                  </div>
                </div>
              </div>

              <div>
                <div className="m-side-h">Files · {attachments.length}</div>
                <div className="m-files">
                  {attachments.map(f => (
                    <div className="m-file" key={f.id}>
                      <div className="m-file-ic">{f.filename.split('.').pop().toUpperCase().slice(0, 4)}</div>
                      <div className="m-file-name">{f.filename}</div>
                      <div className="m-file-size">{f.size > 1024 * 1024
                        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
                        : `${Math.round(f.size / 1024)} KB`}</div>
                      <button className="m-file-x" onClick={() => deleteAttachment(f.id)}>
                        <Icon name="x" size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <label
                  className={`m-drop ${dropOver ? 'over' : ''}`}
                  style={{ marginTop: 6, display: 'block' }}
                  onDragOver={(e) => { e.preventDefault(); setDropOver(true) }}
                  onDragLeave={() => setDropOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDropOver(false); uploadFiles(e.dataTransfer.files) }}
                >
                  <Icon name="upload" style={{ width: 14, height: 14, display: 'block', margin: '0 auto 4px', color: 'var(--ink-3)' }} />
                  <div>Drop files or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span></div>
                  <input type="file" multiple style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
                </label>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>Task not found</div>
        )}
      </div>

      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'grid', placeItems: 'center',
            background: 'rgba(0,0,0,0.45)',
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            style={{
              background: 'var(--bg-elev)', borderRadius: 12,
              padding: '24px 28px', width: 340,
              boxShadow: '0 8px 32px #0003',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name="trash" size={16} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Delete task?</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>This action cannot be undone.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button
                className="btn"
                style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
