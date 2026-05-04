import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import api from '../lib/api'

export default function AuditView() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 50 }
    if (filter !== 'all') params.action = filter
    api.get('/audit', { params })
      .then(data => { setLogs(data.logs); setTotal(data.total) })
      .finally(() => setLoading(false))
  }, [filter, page])

  const evtColor = (action) => {
    if (action === 'create') return 'oklch(0.6 0.13 60)'
    if (action === 'delete') return 'oklch(0.6 0.16 25)'
    if (action === 'update' || action === 'move') return 'oklch(0.6 0.14 280)'
    if (action === 'role_change') return 'oklch(0.6 0.14 220)'
    return 'var(--ink-3)'
  }

  return (
    <div className="audit">
      <div className="audit-head">
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.018em', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            Audit <em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>log</em>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 400, fontFamily: 'var(--mono)', marginLeft: 6 }}>
              <Icon name="shield" style={{ width: 12, height: 12, display: 'inline', marginRight: 5, verticalAlign: '-1px' }} />
              admin · append-only · {total} entries
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>
            Every state change in the workspace, immutable and signed.
          </div>
        </div>
        <div className="audit-filters">
          {['all', 'create', 'update', 'delete', 'role_change'].map(f => (
            <button key={f} className="chip" onClick={() => { setFilter(f); setPage(1) }} style={{
              background: filter === f ? 'var(--ink)' : undefined,
              color: filter === f ? 'var(--bg)' : undefined,
              borderColor: filter === f ? 'var(--ink)' : undefined,
              textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="audit-tbl">
        <div className="audit-hd">
          <span>Timestamp</span>
          <span>Action</span>
          <span>Actor</span>
          <span>Target</span>
        </div>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--ink-3)', textAlign: 'center' }}>Loading…</div>
        ) : logs.map(r => (
          <div className="audit-row" key={r.id}>
            <span className="audit-time">{new Date(r.createdAt).toLocaleString()}</span>
            <span className="audit-evt">
              <span className="pill" style={{ color: evtColor(r.action), borderColor: 'currentColor' }}>{r.action}</span>
              <b>{r.entity} #{r.entityId}</b>
            </span>
            <span className="audit-actor">
              {r.actor ? <><Avatar user={r.actor} size={20} /> {r.actor.name}</> : <span style={{ color: 'var(--ink-4)' }}>system</span>}
            </span>
            <span className="audit-target">{r.entity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
