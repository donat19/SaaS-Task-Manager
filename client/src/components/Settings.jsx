import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Section({ title, description, children }) {
  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Row({ label, description, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 20, padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--line-soft)',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        all: 'unset', cursor: 'pointer', width: 40, height: 22, borderRadius: 999,
        background: value ? 'var(--accent)' : 'var(--line)',
        position: 'relative', transition: 'background 0.2s', display: 'block',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px #0003', transition: 'left 0.2s',
      }} />
    </button>
  )
}

function applyHue(hue, isDark) {
  const root = document.documentElement
  if (isDark) {
    root.style.setProperty('--accent', `oklch(0.72 0.16 ${hue})`)
    root.style.setProperty('--accent-soft', `oklch(0.28 0.06 ${hue})`)
    root.style.setProperty('--accent-ink', `oklch(0.85 0.14 ${hue})`)
  } else {
    root.style.setProperty('--accent', `oklch(0.55 0.16 ${hue})`)
    root.style.setProperty('--accent-soft', `oklch(0.96 0.025 ${hue})`)
    root.style.setProperty('--accent-ink', `oklch(0.4 0.18 ${hue})`)
  }
}

export default function Settings({ dark, setDark }) {
  const { user } = useAuth()

  const [accentHue, setAccentHue] = useState(() => Number(localStorage.getItem('accentHue') ?? 280))
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable')
  const [notifComments, setNotifComments] = useState(() => localStorage.getItem('notif_comments') !== 'false')
  const [notifAssign, setNotifAssign] = useState(() => localStorage.getItem('notif_assign') !== 'false')

  // Apply saved hue and density on mount
  useEffect(() => {
    applyHue(accentHue, dark)
    document.documentElement.setAttribute('data-density', density)
  }, [])

  // Re-apply hue when dark mode changes
  useEffect(() => {
    applyHue(accentHue, dark)
  }, [dark])

  const changeHue = (hue) => {
    setAccentHue(hue)
    localStorage.setItem('accentHue', hue)
    applyHue(hue, dark)
  }

  const changeDensity = (d) => {
    setDensity(d)
    localStorage.setItem('density', d)
    document.documentElement.setAttribute('data-density', d)
  }

  const changeNotifComments = (v) => { setNotifComments(v); localStorage.setItem('notif_comments', v) }
  const changeNotifAssign = (v) => { setNotifAssign(v); localStorage.setItem('notif_assign', v) }

  const shortcuts = [
    ['N', 'Create new task'],
    ['⌘K', 'Open search'],
    ['⌘/', 'Show all shortcuts'],
    ['⌘.', 'Toggle dark mode'],
    ['Esc', 'Close modal'],
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 640, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px' }}>Settings</h1>

      <Section title="Appearance" description="Customize how Strata looks for you.">
        <Row label="Dark mode" description="Toggle between light and dark theme">
          <Toggle value={dark} onChange={setDark} />
        </Row>
        <Row label="Accent color" description="Choose your interface accent hue">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range" min={0} max={360} value={accentHue}
              onChange={e => changeHue(Number(e.target.value))}
              style={{ width: 120, accentColor: `oklch(0.6 0.18 ${accentHue})`, cursor: 'pointer' }}
            />
            <span style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: `oklch(0.6 0.18 ${accentHue})`,
              border: '2px solid var(--line)',
            }} />
          </div>
        </Row>
        <Row label="Density" description="Control how compact the interface is" last>
          <div style={{ display: 'flex', gap: 6 }}>
            {['compact', 'comfortable'].map(d => (
              <button
                key={d}
                onClick={() => changeDensity(d)}
                style={{
                  all: 'unset', cursor: 'pointer', padding: '5px 12px', borderRadius: 7,
                  fontSize: 12, fontFamily: 'inherit', border: '1px solid',
                  fontWeight: density === d ? 600 : 400,
                  borderColor: density === d ? 'var(--accent)' : 'var(--line)',
                  background: density === d ? 'var(--accent-soft)' : 'var(--bg-soft)',
                  color: density === d ? 'var(--accent-ink)' : 'var(--ink-2)',
                  transition: 'all 0.12s',
                }}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Notifications" description="Choose what you get notified about.">
        <Row label="New comments" description="When someone comments on a task you're assigned to">
          <Toggle value={notifComments} onChange={changeNotifComments} />
        </Row>
        <Row label="Task assignments" description="When you're added to a task" last>
          <Toggle value={notifAssign} onChange={changeNotifAssign} />
        </Row>
      </Section>

      {user?.role === 'admin' && (
        <Section title="Workspace" description="Workspace-level settings (admin only).">
          <Row label="Workspace name" description="Displayed in the sidebar and breadcrumbs">
            <input
              defaultValue="Product team"
              style={{
                all: 'unset', padding: '6px 10px', fontSize: 12.5, color: 'var(--ink)',
                background: 'var(--bg-soft)', border: '1px solid var(--line)',
                borderRadius: 8, fontFamily: 'inherit', width: 160,
              }}
            />
          </Row>
          <Row label="Default task status" description="Status assigned to new tasks" last>
            <select
              defaultValue="todo"
              style={{
                all: 'unset', cursor: 'pointer', padding: '6px 10px', fontSize: 12.5, color: 'var(--ink)',
                background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit',
              }}
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
            </select>
          </Row>
        </Section>
      )}

      <Section title="Keyboard shortcuts">
        {shortcuts.map(([key, label], i) => (
          <div
            key={key}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              borderBottom: i < shortcuts.length - 1 ? '1px solid var(--line-soft)' : 'none',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>
            <kbd style={{
              fontFamily: 'var(--mono)', fontSize: 11,
              background: 'var(--bg-soft)', border: '1px solid var(--line)',
              padding: '2px 8px', borderRadius: 5, color: 'var(--ink-3)',
            }}>{key}</kbd>
          </div>
        ))}
      </Section>
    </div>
  )
}
