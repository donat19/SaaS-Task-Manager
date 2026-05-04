import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import api from '../lib/api'

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: '#ef4444' },
  { id: 'high',   label: 'High',   color: '#f97316' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'low',    label: 'Low',    color: '#6b7280' },
]

function Dropdown({ label, icon, children, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
          gap: 5, padding: '4px 10px', borderRadius: 7, fontSize: 12.5,
          border: '1px solid',
          borderColor: active ? 'var(--accent)' : 'var(--line)',
          background: active ? 'var(--accent-soft)' : 'var(--bg-elev)',
          color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
          fontFamily: 'inherit', fontWeight: active ? 600 : 400,
          transition: 'all 0.12s',
        }}
      >
        {icon && <Icon name={icon} style={{ width: 12, height: 12 }} />}
        {label}
        <Icon name="chev" style={{ width: 11, height: 11, transform: open ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: 'var(--bg-elev)', border: '1px solid var(--line)',
          borderRadius: 10, boxShadow: '0 4px 20px #0002',
          padding: 6, minWidth: 180,
          animation: 'slideUp 0.15s cubic-bezier(0.2,0.8,0.2,1)',
        }}>
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  )
}

function OptionItem({ label, selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
        fontSize: 12.5, color: selected ? 'var(--accent-ink)' : 'var(--ink)',
        background: selected ? 'var(--accent-soft)' : 'transparent',
        fontFamily: 'inherit', boxSizing: 'border-box',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-soft)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
      {selected && <Icon name="check" style={{ width: 12, height: 12, marginLeft: 'auto', color: 'var(--accent)' }} />}
    </button>
  )
}

export default function FilterBar({ filters, onChange }) {
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])

  useEffect(() => {
    api.get('/users').then(setUsers).catch(() => {})
    api.get('/tags').then(setTags).catch(() => {})
  }, [])

  const toggle = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: next.length ? next : undefined })
  }

  const activeCount = Object.values(filters).filter(v => v?.length).length

  const removeChip = (key, value) => {
    const next = (filters[key] || []).filter(v => v !== value)
    onChange({ ...filters, [key]: next.length ? next : undefined })
  }

  const priorityFilters = filters.priority || []
  const assigneeFilters = filters.assignee || []
  const tagFilters = filters.tag || []

  const activeChips = [
    ...priorityFilters.map(p => ({ key: 'priority', value: p, label: PRIORITIES.find(x => x.id === p)?.label || p })),
    ...assigneeFilters.map(id => {
      const u = users.find(u => u.id === id)
      return { key: 'assignee', value: id, label: u?.name || id, user: u }
    }),
    ...tagFilters.map(id => {
      const t = tags.find(t => t.id === id)
      return { key: 'tag', value: id, label: t?.name || id, color: t?.color }
    }),
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {/* Priority filter */}
      <Dropdown
        label="Priority"
        icon="flag"
        active={priorityFilters.length > 0}
      >
        {() => PRIORITIES.map(p => (
          <OptionItem
            key={p.id}
            selected={priorityFilters.includes(p.id)}
            onClick={() => toggle('priority', p.id)}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            {p.label}
          </OptionItem>
        ))}
      </Dropdown>

      {/* Assignee filter */}
      <Dropdown
        label="Assignee"
        icon="user"
        active={assigneeFilters.length > 0}
      >
        {() => users.map(u => (
          <OptionItem
            key={u.id}
            selected={assigneeFilters.includes(u.id)}
            onClick={() => toggle('assignee', u.id)}
          >
            <Avatar user={u} size={20} />
            {u.name}
          </OptionItem>
        ))}
      </Dropdown>

      {/* Tag filter */}
      <Dropdown
        label="Tag"
        icon="grid"
        active={tagFilters.length > 0}
      >
        {() => tags.map(t => (
          <OptionItem
            key={t.id}
            selected={tagFilters.includes(t.id)}
            onClick={() => toggle('tag', t.id)}
          >
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 11,
              background: t.color + '22', color: t.color, border: `1px solid ${t.color}55`,
            }}>{t.name}</span>
          </OptionItem>
        ))}
      </Dropdown>

      {/* Active chips */}
      {activeChips.map(chip => (
        <span
          key={`${chip.key}-${chip.value}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 6px 3px 9px', borderRadius: 999,
            background: chip.color ? chip.color + '22' : 'var(--accent-soft)',
            border: `1px solid ${chip.color || 'var(--accent)'}55`,
            color: chip.color || 'var(--accent-ink)',
            fontSize: 11.5, fontWeight: 500,
          }}
        >
          {chip.user && <Avatar user={chip.user} size={14} />}
          {chip.label}
          <button
            onClick={() => removeChip(chip.key, chip.value)}
            style={{
              all: 'unset', cursor: 'pointer', display: 'grid', placeItems: 'center',
              width: 14, height: 14, borderRadius: '50%',
              background: 'oklch(0 0 0 / 0.1)',
            }}
          >
            <Icon name="x" style={{ width: 9, height: 9 }} />
          </button>
        </span>
      ))}

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({})}
          style={{
            all: 'unset', cursor: 'pointer', fontSize: 12, color: 'var(--ink-3)',
            padding: '3px 8px', borderRadius: 6, fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
