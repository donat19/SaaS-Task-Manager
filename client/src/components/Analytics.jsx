import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Avatar } from './Atoms'
import api from '../lib/api'

const STATUS_COLORS = {
  backlog: 'oklch(0.6 0.04 220)',
  todo: 'oklch(0.6 0.13 60)',
  in_progress: 'oklch(0.6 0.14 280)',
  in_review: 'oklch(0.6 0.14 220)',
  done: 'oklch(0.6 0.13 150)',
}
const STATUS_LABELS = {
  backlog: 'Backlog', todo: 'To do', in_progress: 'In progress',
  in_review: 'In review', done: 'Done',
}
const PRIORITY_COLORS = {
  urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12,
      padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: color + '20',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} style={{ width: 18, height: 18, color }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

function BarChart({ data, dark }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.created, d.completed)), 1)
  const W = 600, H = 180, PAD = { top: 16, right: 8, bottom: 40, left: 32 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom
  const barW = chartW / data.length
  const barPad = barW * 0.18

  const safeMax = maxVal || 1
  const yTicks = [0, Math.round(safeMax / 2), safeMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid lines */}
      {yTicks.map((t, ti) => {
        const y = PAD.top + chartH - (t / safeMax) * chartH
        return (
          <g key={`tick-${ti}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="var(--line)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10}
              fill="var(--ink-4)">{t}</text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD.left + i * barW
        const createdH = (d.created / safeMax) * chartH
        const completedH = (d.completed / safeMax) * chartH

        return (
          <g key={`bar-${i}-${d.label}`}>
            {/* Created bar */}
            <rect
              x={x + barPad} y={PAD.top + chartH - createdH}
              width={barW / 2 - barPad} height={createdH}
              rx={3} fill="var(--accent)" opacity={0.35}
            />
            {/* Completed bar */}
            <rect
              x={x + barW / 2} y={PAD.top + chartH - completedH}
              width={barW / 2 - barPad} height={completedH}
              rx={3} fill="var(--accent)"
            />
            {/* X label */}
            <text
              x={x + barW / 2} y={H - 8}
              textAnchor="middle" fontSize={10} fill="var(--ink-4)"
            >{d.label}</text>
          </g>
        )
      })}

      {/* X axis */}
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH} y2={PAD.top + chartH}
        stroke="var(--line)" strokeWidth={1} />
    </svg>
  )
}

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1
  const r = 44, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const slices = segments.map(seg => {
    const pct = seg.value / total
    const dash = pct * circumference
    const slice = { ...seg, dash, gap: circumference - dash, offset }
    offset += dash
    return slice
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={18} />
      {slices.map((s, i) => (
        <circle key={`donut-${s.label ?? i}`} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={18}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={circumference / 4 - s.offset}
          style={{ transition: 'stroke-dasharray 0.4s' }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ink)">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="var(--ink-4)">tasks</text>
    </svg>
  )
}

export default function Analytics({ dark }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats').then(s => { setStats(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
      Loading…
    </div>
  )

  if (!stats) return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
      Failed to load stats
    </div>
  )

  const { summary, byStatus, byPriority, weekly, topAssignees } = stats
  const completionRate = summary.total ? Math.round((summary.done / summary.total) * 100) : 0

  const statusSegments = byStatus.map(s => ({
    label: STATUS_LABELS[s.status] || s.status,
    value: s._count.id,
    color: STATUS_COLORS[s.status] || 'var(--ink-4)',
  }))

  const prioritySegments = byPriority.map(p => ({
    label: p.priority,
    value: p._count.id,
    color: PRIORITY_COLORS[p.priority] || 'var(--ink-4)',
  }))

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>Overview of workspace activity</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => {
            const rows = [['Status', 'Count'], ...byStatus.map(s => [STATUS_LABELS[s.status], s._count.id])]
            const csv = rows.map(r => r.join(',')).join('\n')
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
            a.download = 'strata-stats.csv'
            a.click()
          }}
        >
          <Icon name="download" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon="layers" label="Total tasks" value={summary.total} color="var(--accent)" />
        <StatCard icon="check" label="Completed" value={summary.done}
          sub={`${completionRate}% completion rate`} color="oklch(0.6 0.13 150)" />
        <StatCard icon="activity" label="In progress" value={summary.inProgress} color="oklch(0.6 0.14 280)" />
        <StatCard icon="cal" label="Overdue" value={summary.overdue}
          sub="Past due date" color="#ef4444" />
      </div>

      {/* Weekly chart + Status donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, marginBottom: 14 }}>
        {/* Bar chart */}
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>Weekly activity</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--ink-4)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', opacity: 0.35, display: 'inline-block' }} />
                Created
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />
                Completed
              </span>
            </div>
          </div>
          <BarChart data={weekly} dark={dark} />
        </div>

        {/* Status donut */}
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 16 }}>By status</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <DonutChart segments={statusSegments} size={130} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {statusSegments.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--ink-2)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-3)', fontSize: 11 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority breakdown + Top assignees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Priority */}
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 16 }}>By priority</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['urgent', 'high', 'medium', 'low'].map(p => {
              const seg = prioritySegments.find(s => s.label === p)
              const val = seg?.value || 0
              const max = Math.max(...prioritySegments.map(s => s.value), 1)
              return (
                <div key={p}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--ink-2)', textTransform: 'capitalize' }}>{p}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-4)', fontSize: 11 }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-soft)', borderRadius: 999 }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${(val / max) * 100}%`,
                      background: PRIORITY_COLORS[p],
                      transition: 'width 0.5s cubic-bezier(0.2,0.8,0.2,1)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top assignees */}
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)', marginBottom: 16 }}>Top contributors</div>
          {topAssignees.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-4)', textAlign: 'center', paddingTop: 20 }}>No completed tasks yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topAssignees.map((a, i) => {
                const max = topAssignees[0].count
                return (
                  <div key={a.user.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)', width: 14, textAlign: 'right' }}>{i + 1}</span>
                    <Avatar user={a.user} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 550, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.user.name}</div>
                      <div style={{ height: 4, background: 'var(--bg-soft)', borderRadius: 999, marginTop: 4 }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${(a.count / max) * 100}%`,
                          background: 'var(--accent)',
                          transition: 'width 0.5s cubic-bezier(0.2,0.8,0.2,1)',
                        }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>{a.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
