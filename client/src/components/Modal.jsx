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
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
                <button className="icbtn" title="More"><Icon name="more" /></button>
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
    </div>
  )
}
