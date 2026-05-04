import { useEffect } from 'react'
import Icon from './Icon'

const shortcuts = [
  { key: '⌘K', desc: 'Open search' },
  { key: '⌘/', desc: 'Show shortcuts' },
  { key: '⌘.', desc: 'Toggle dark mode' },
  { key: 'N', desc: 'New task (from board)' },
  { key: 'G B', desc: 'Go to Board view' },
  { key: 'G T', desc: 'Go to Table view' },
  { key: 'Esc', desc: 'Close modal / dialog' },
  { key: '⌘⏎', desc: 'Submit comment' },
]

export default function Shortcuts({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose}>
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 14, padding: '24px 28px', maxWidth: 420, width: '100%',
        boxShadow: '0 24px 60px #0007', border: '1px solid var(--line)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Keyboard shortcuts</div>
          <button className="icbtn" onClick={onClose}><Icon name="x" /></button>
        </div>
        {shortcuts.map(s => (
          <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{s.desc}</span>
            <kbd style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 5, padding: '2px 7px' }}>{s.key}</kbd>
          </div>
        ))}
      </div>
    </div>
  )
}
