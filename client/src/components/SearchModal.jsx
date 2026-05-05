import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { Tag, StatusPill } from './Atoms'
import api from '../lib/api'

export default function SearchModal({ onClose, onOpenTask }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ tasks: [], comments: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!query.trim()) { setResults({ tasks: [], comments: [] }); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.get('/search', { params: { q: query } })
        setResults(data)
      } catch {}
      finally { setLoading(false) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const total = results.tasks.length + results.comments.length
  const hasResults = total > 0

  return (
    <div className="scrim" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <Icon name="search" className="ic" style={{ width: 16, height: 16, color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, comments…"
            className="search-input"
          />
          {loading && <div className="search-spinner" />}
          <kbd onClick={onClose}>Esc</kbd>
        </div>

        {query.trim() && (
          <div className="search-results">
            {!hasResults && !loading && (
              <div className="search-empty">No results for "<b>{query}</b>"</div>
            )}

            {results.tasks.length > 0 && (
              <div className="search-section">
                <div className="search-section-h">Tasks · {results.tasks.length}</div>
                {results.tasks.map(t => (
                  <div key={t.id} className="search-item" onClick={() => { onOpenTask(t.id); onClose() }}>
                    <div className="search-item-id">STR-{t.id}</div>
                    <div className="search-item-body">
                      <div className="search-item-title">{highlight(t.title, query)}</div>
                      {t.description && (
                        <div className="search-item-sub">{highlight(t.description.slice(0, 80), query)}</div>
                      )}
                    </div>
                    <StatusPill status={t.status} />
                    {t.tags?.slice(0, 2).map(tt => <Tag key={tt.tagId} tag={tt.tag} />)}
                  </div>
                ))}
              </div>
            )}

            {results.comments.length > 0 && (
              <div className="search-section">
                <div className="search-section-h">Comments · {results.comments.length}</div>
                {results.comments.map(c => (
                  <div key={c.id} className="search-item" onClick={() => { onOpenTask(c.taskId); onClose() }}>
                    <Icon name="msg" style={{ width: 13, height: 13, color: 'var(--ink-3)', flexShrink: 0 }} />
                    <div className="search-item-body">
                      <div className="search-item-sub">{highlight(c.text.slice(0, 100), query)}</div>
                      <div className="search-item-meta">in <b>{c.task?.title}</b> · {c.user?.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="search-hint-list">
            <div className="search-hint-item"><Icon name="arrow" style={{ width: 12, height: 12 }} /> Start typing to search tasks and comments</div>
            <div className="search-hint-item"><kbd>↑↓</kbd> Navigate &nbsp; <kbd>↵</kbd> Open &nbsp; <kbd>Esc</kbd> Close</div>
          </div>
        )}
      </div>
    </div>
  )
}

function highlight(text, query) {
  if (!query || !text) return text
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    re.test(p) ? <mark key={`hl-${i}-${p}`} style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 2, padding: '0 1px' }}>{p}</mark> : p
  )
}
