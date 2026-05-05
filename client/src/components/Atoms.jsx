// Reusable atoms: Avatar, Tag, StatusPill, PriorityPill, Avatars

const COLUMNS = [
  { id: 'backlog',     title: 'Backlog',     color: 'oklch(0.6 0.04 220)' },
  { id: 'todo',        title: 'To do',       color: 'oklch(0.6 0.13 60)' },
  { id: 'in_progress', title: 'In progress', color: 'oklch(0.6 0.14 280)' },
  { id: 'in_review',   title: 'In review',   color: 'oklch(0.6 0.14 220)' },
  { id: 'done',        title: 'Done',        color: 'oklch(0.6 0.13 150)' },
]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name = '') {
  const hues = [280, 60, 150, 220, 25, 180, 320]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % hues.length
  return `oklch(0.55 0.14 ${hues[h]})`
}

export function Avatar({ user, size = 24, style }) {
  if (!user) return null
  const dim = { width: size, height: size, fontSize: Math.round(size * 0.4), ...style }
  if (user.avatar) {
    return <img className="av" src={user.avatar} style={{ ...dim, objectFit: 'cover', borderRadius: '50%' }} alt={user.name} />
  }
  return (
    <div className="av" style={{ ...dim, background: avatarColor(user.name) }} title={user.name}>
      {initials(user.name)}
    </div>
  )
}

export function Tag({ tag, dark }) {
  if (!tag) return null
  const c = tag.color
  const isDark = dark ?? document.documentElement.classList.contains('dark')
  const bg = isDark ? `oklch(from ${c} 0.25 0.08 h / 0.7)` : `oklch(from ${c} 0.94 0.06 h)`
  const fg = isDark ? `oklch(from ${c} 0.82 0.14 h)` : `oklch(from ${c} 0.38 0.18 h)`
  const border = isDark ? `oklch(from ${c} 0.38 0.1 h)` : `oklch(from ${c} 0.78 0.1 h)`
  return (
    <span className="tag" style={{ background: bg, color: fg, border: `1px solid ${border}` }}>
      {tag.name}
    </span>
  )
}

export function StatusPill({ status, dark }) {
  const col = COLUMNS.find(c => c.id === status)
  if (!col) return null
  const bg = dark ? `oklch(from ${col.color} 0.28 0.06 h)` : `oklch(from ${col.color} 0.95 0.04 h)`
  const fg = dark ? `oklch(from ${col.color} 0.85 0.12 h)` : `oklch(from ${col.color} 0.4 0.15 h)`
  return (
    <span className="pill" style={{ background: bg, color: fg }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: col.color }} /> {col.title}
    </span>
  )
}

export function PriorityPill({ priority }) {
  const map = {
    urgent: { c: 'oklch(0.55 0.2 25)', l: 'Urgent' },
    high:   { c: 'oklch(0.62 0.16 25)', l: 'High' },
    medium: { c: 'oklch(0.65 0.13 80)', l: 'Medium' },
    low:    { c: 'oklch(0.65 0.04 220)', l: 'Low' },
  }
  const m = map[priority] || map.low
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-2)' }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: m.c }} /> {m.l}
    </span>
  )
}

export function Avatars({ users = [], size = 22 }) {
  return (
    <div style={{ display: 'flex' }}>
      {users.map((u, i) => (
        <div key={u.id} style={{ marginLeft: i ? -6 : 0, border: '1.5px solid var(--bg-elev)', borderRadius: '50%' }}>
          <Avatar user={u} size={size} />
        </div>
      ))}
    </div>
  )
}

export { COLUMNS }
