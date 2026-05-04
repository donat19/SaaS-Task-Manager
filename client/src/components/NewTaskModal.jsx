import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Avatar, COLUMNS } from './Atoms'
import api from '../lib/api'

const field = {
  all: 'unset',
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '7px 10px',
  fontSize: 13,
  color: 'var(--ink)',
  background: 'var(--bg-soft)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  fontFamily: 'inherit',
}

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
]

export default function NewTaskModal({ onClose, onCreated, dark, initialStatus }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(initialStatus || 'todo')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [selectedAssignees, setSelectedAssignees] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366f1')
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/tags')])
      .then(([u, t]) => { setUsers(u); setTags(t) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleAssignee = (id) =>
    setSelectedAssignees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleTag = (id) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const createTag = async () => {
    if (!newTagName.trim()) return
    setCreatingTag(true)
    try {
      const tag = await api.post('/tags', { name: newTagName.trim(), color: newTagColor })
      setTags(prev => [...prev, tag])
      setSelectedTags(prev => [...prev, tag.id])
      setNewTagName('')
    } catch {}
    setCreatingTag(false)
  }

  const submit = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const task = await api.post('/tasks', {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assigneeIds: selectedAssignees,
        tagIds: selectedTags,
      })
      onCreated(task)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create task')
      setSaving(false)
    }
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 'var(--r-xl, 16px)',
          width: '100%',
          maxWidth: 520,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 0', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 650, color: 'var(--ink)', flex: 1 }}>New task</span>
          <button className="icbtn" onClick={onClose}><Icon name="x" /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <input
            style={{ ...field, fontSize: 15, fontWeight: 550, padding: '9px 12px' }}
            placeholder="Task title"
            value={title}
            onChange={e => { setTitle(e.target.value); if (error) setError('') }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
            autoFocus
          />

          {/* Description */}
          <textarea
            style={{ ...field, minHeight: 72, resize: 'vertical', lineHeight: 1.5, padding: '9px 12px' }}
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div className="m-side-h" style={{ marginBottom: 6 }}>Status</div>
              <select style={{ ...field, cursor: 'pointer' }} value={status} onChange={e => setStatus(e.target.value)}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <div className="m-side-h" style={{ marginBottom: 6 }}>Priority</div>
              <select style={{ ...field, cursor: 'pointer' }} value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <div className="m-side-h" style={{ marginBottom: 6 }}>Due date</div>
            <input
              type="date"
              style={{ ...field, colorScheme: dark ? 'dark' : 'light' }}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* Assignees */}
          {users.length > 0 && (
            <div>
              <div className="m-side-h" style={{ marginBottom: 8 }}>Assignees</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {users.map(u => {
                  const on = selectedAssignees.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleAssignee(u.id)}
                      style={{
                        all: 'unset', display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '5px 10px 5px 6px', borderRadius: 999, border: '1px solid',
                        fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                        borderColor: on ? 'var(--accent)' : 'var(--line)',
                        background: on ? 'var(--accent-soft)' : 'var(--bg-soft)',
                        color: on ? 'var(--accent-ink)' : 'var(--ink-2)',
                        transition: 'all 0.12s',
                      }}
                    >
                      <Avatar user={u} size={20} />
                      {u.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <div className="m-side-h" style={{ marginBottom: 8 }}>Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {tags.map(tag => {
                const on = selectedTags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      all: 'unset', display: 'inline-flex', alignItems: 'center',
                      padding: '4px 12px', borderRadius: 999, border: '1px solid',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      background: on ? tag.color + '22' : 'var(--bg-soft)',
                      borderColor: on ? tag.color : 'var(--line)',
                      color: on ? tag.color : 'var(--ink-3)',
                      fontWeight: on ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
            {/* Create new tag */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: 'var(--bg-soft)', border: '1px solid var(--line)',
                borderRadius: 8, overflow: 'hidden', flex: 1,
              }}>
                <input
                  style={{
                    all: 'unset', flex: 1, padding: '6px 10px',
                    fontSize: 12.5, color: 'var(--ink)', fontFamily: 'inherit',
                  }}
                  placeholder="New tag name…"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createTag() }}
                  maxLength={24}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  title="Pick color"
                  style={{
                    appearance: 'none', width: 28, height: 28,
                    border: 'none', borderLeft: '1px solid var(--line)',
                    padding: 4, cursor: 'pointer', background: 'none',
                    flexShrink: 0,
                  }}
                />
              </div>
              <button
                className="btn btn-ghost"
                onClick={createTag}
                disabled={!newTagName.trim() || creatingTag}
                style={{ flexShrink: 0, fontSize: 12, padding: '6px 12px' }}
              >
                <Icon name="plus" /> Add
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 12, color: '#ef4444', padding: '6px 10px',
              background: '#fee2e2', borderRadius: 7,
            }}>
              {error}
            </div>
          )}

          {/* Divider + Actions */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
