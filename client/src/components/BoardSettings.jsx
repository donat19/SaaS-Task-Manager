import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Avatar, COLUMNS } from './Atoms'
import api from '../lib/api'

const PRESET_COLORS = [
  'oklch(0.6 0.14 280)', 'oklch(0.6 0.16 150)', 'oklch(0.6 0.16 30)',
  'oklch(0.6 0.16 200)', 'oklch(0.6 0.16 340)', 'oklch(0.6 0.14 60)',
  'oklch(0.6 0.04 220)', 'oklch(0.6 0.13 320)',
]

function Tab({ id, active, onClick, children }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        all: 'unset', cursor: 'pointer', padding: '7px 14px', fontSize: 13,
        fontFamily: 'inherit', borderRadius: 8, fontWeight: active ? 600 : 400,
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent-ink)' : 'var(--ink-3)',
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function MembersTab({ boardId }) {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`board-members-${boardId}`) || 'null') } catch { return null }
  })

  useEffect(() => {
    api.get('/users').then(setUsers).catch(() => {})
  }, [])

  const memberIds = selected ?? users.map(u => u.id)

  const toggle = (id) => {
    const next = memberIds.includes(id) ? memberIds.filter(x => x !== id) : [...memberIds, id]
    setSelected(next)
    localStorage.setItem(`board-members-${boardId}`, JSON.stringify(next))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 8 }}>
        Choose who has access to this board. All members can still see tasks they're assigned to.
      </div>
      {users.map(u => {
        const on = memberIds.includes(u.id)
        return (
          <div
            key={u.id}
            onClick={() => toggle(u.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 9, cursor: 'pointer', transition: 'background 0.1s',
              background: on ? 'var(--accent-soft)' : 'var(--bg-soft)',
              border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
            }}
          >
            <Avatar user={u} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: on ? 'var(--accent-ink)' : 'var(--ink)' }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>{u.email}</div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
              background: on ? 'var(--accent)' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              {on && <Icon name="check" style={{ width: 10, height: 10, color: '#fff' }} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const OKLCH_TO_HEX = {
  'oklch(0.6 0.04 220)': '#5f7a9f',
  'oklch(0.6 0.13 60)':  '#b07d20',
  'oklch(0.6 0.14 280)': '#7c3aed',
  'oklch(0.6 0.14 220)': '#2563eb',
  'oklch(0.6 0.13 150)': '#16a34a',
  'oklch(0.6 0.16 150)': '#15803d',
  'oklch(0.6 0.16 30)':  '#dc6a1a',
  'oklch(0.6 0.16 200)': '#0284c7',
  'oklch(0.6 0.16 340)': '#db2777',
  'oklch(0.6 0.14 60)':  '#ca8a04',
}

function toHex(color) {
  return OKLCH_TO_HEX[color] || (color.startsWith('#') ? color : '#6366f1')
}

function ColumnsTab({ boardId }) {
  const [cols, setCols] = useState(() => {
    try {
      const saved = localStorage.getItem(`board-columns-${boardId}`)
      return saved ? JSON.parse(saved) : COLUMNS.map(c => ({ ...c, color: toHex(c.color) }))
    } catch { return COLUMNS.map(c => ({ ...c, color: toHex(c.color) })) }
  })
  const [newName, setNewName] = useState('')

  const save = (next) => {
    setCols(next)
    localStorage.setItem(`board-columns-${boardId}`, JSON.stringify(next))
  }

  const rename = (id, title) => save(cols.map(c => c.id === id ? { ...c, title } : c))

  const changeColor = (id, color) => save(cols.map(c => c.id === id ? { ...c, color } : c))

  const remove = (id) => save(cols.filter(c => c.id !== id))

  const add = () => {
    if (!newName.trim()) return
    const id = newName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (cols.find(c => c.id === id)) return
    save([...cols, { id: `custom_${Date.now()}`, title: newName.trim(), color: PRESET_COLORS[cols.length % PRESET_COLORS.length] }])
    setNewName('')
  }

  const move = (i, dir) => {
    const next = [...cols]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    save(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>
        Drag to reorder, rename or change the color of each column.
      </div>
      {cols.map((c, i) => (
        <div key={c.id} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 9,
          background: 'var(--bg-soft)', border: '1px solid var(--line)',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
          <input
            value={c.title}
            onChange={e => rename(c.id, e.target.value)}
            style={{
              all: 'unset', flex: 1, fontSize: 13, color: 'var(--ink)',
              fontFamily: 'inherit', minWidth: 0,
            }}
          />
          <input
            type="color"
            value={c.color}
            onChange={e => changeColor(c.id, e.target.value)}
            title="Column color"
            style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 4 }}
          />
          <button onClick={() => move(i, -1)} disabled={i === 0} style={{ all: 'unset', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--ink-4)' : 'var(--ink-2)', fontSize: 12, lineHeight: 1 }}>↑</button>
          <button onClick={() => move(i, 1)} disabled={i === cols.length - 1} style={{ all: 'unset', cursor: i === cols.length - 1 ? 'default' : 'pointer', color: i === cols.length - 1 ? 'var(--ink-4)' : 'var(--ink-2)', fontSize: 12, lineHeight: 1 }}>↓</button>
          <button
            onClick={() => remove(c.id)}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--ink-4)', display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
          >
            <Icon name="x" style={{ width: 12, height: 12 }} />
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          placeholder="New column name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add() }}
          style={{
            all: 'unset', flex: 1, padding: '7px 11px', fontSize: 13,
            background: 'var(--bg-soft)', border: '1px solid var(--line)',
            borderRadius: 8, color: 'var(--ink)', fontFamily: 'inherit',
          }}
        />
        <button className="btn btn-ghost" onClick={add} disabled={!newName.trim()} style={{ fontSize: 12 }}>
          <Icon name="plus" /> Add
        </button>
      </div>
    </div>
  )
}

function TagsTab({ boardId }) {
  const [tags, setTags] = useState([])
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`board-tags-${boardId}`) || 'null') } catch { return null }
  })
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.get('/tags').then(setTags).catch(() => {})
  }, [])

  const tagIds = selected ?? tags.map(t => t.id)

  const toggle = (id) => {
    const next = tagIds.includes(id) ? tagIds.filter(x => x !== id) : [...tagIds, id]
    setSelected(next)
    localStorage.setItem(`board-tags-${boardId}`, JSON.stringify(next))
  }

  const createTag = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const tag = await api.post('/tags', { name: newName.trim(), color: newColor })
      setTags(prev => [...prev, tag])
      const next = [...tagIds, tag.id]
      setSelected(next)
      localStorage.setItem(`board-tags-${boardId}`, JSON.stringify(next))
      setNewName('')
    } catch {}
    setCreating(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>
        Select which tags are available in this board.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {tags.map(tag => {
          const on = tagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => toggle(tag.id)}
              style={{
                all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                gap: 6, padding: '5px 13px', borderRadius: 999, fontSize: 12.5,
                border: `1px solid ${on ? tag.color : 'var(--line)'}`,
                background: on ? tag.color + '22' : 'var(--bg-soft)',
                color: on ? tag.color : 'var(--ink-3)', fontWeight: on ? 600 : 400,
                transition: 'all 0.12s', fontFamily: 'inherit',
              }}
            >
              {on && <Icon name="check" style={{ width: 10, height: 10 }} />}
              {tag.name}
            </button>
          )
        })}
        {tags.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>No tags yet.</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden',
        }}>
          <input
            placeholder="New tag name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createTag() }}
            maxLength={24}
            style={{ all: 'unset', flex: 1, padding: '7px 10px', fontSize: 13, color: 'var(--ink)', fontFamily: 'inherit' }}
          />
          <input
            type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
            style={{ width: 28, height: 28, border: 'none', borderLeft: '1px solid var(--line)', padding: 4, cursor: 'pointer', background: 'none', flexShrink: 0 }}
          />
        </div>
        <button className="btn btn-ghost" onClick={createTag} disabled={!newName.trim() || creating} style={{ fontSize: 12 }}>
          <Icon name="plus" /> Add
        </button>
      </div>
    </div>
  )
}

export default function BoardSettings({ boardId, boardName, onClose }) {
  const [tab, setTab] = useState('members')

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)', borderRadius: 16, width: '100%', maxWidth: 520,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 12px 48px #0005', animation: 'slideUp 0.22s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 20px 0', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: 'var(--ink)' }}>Board settings</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 1 }}>{boardName}</div>
          </div>
          <button className="icbtn" onClick={onClose}><Icon name="x" /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0' }}>
          <Tab id="members" active={tab === 'members'} onClick={setTab}>Members</Tab>
          <Tab id="columns" active={tab === 'columns'} onClick={setTab}>Columns</Tab>
          <Tab id="tags"    active={tab === 'tags'}    onClick={setTab}>Tags</Tab>
        </div>
        <div style={{ height: 1, background: 'var(--line)', margin: '10px 20px 0' }} />

        {/* Body */}
        <div style={{ padding: '16px 20px 20px', overflowY: 'auto', flex: 1 }}>
          {tab === 'members' && <MembersTab boardId={boardId} />}
          {tab === 'columns' && <ColumnsTab boardId={boardId} />}
          {tab === 'tags'    && <TagsTab    boardId={boardId} />}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 18px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
