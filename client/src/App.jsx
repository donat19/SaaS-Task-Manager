import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import { getSocket } from './lib/socket'
import api from './lib/api'

import Icon from './components/Icon'
import { Avatar } from './components/Atoms'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import TableView from './components/Table'
import TaskModal from './components/Modal'
import AuditView from './components/Audit'
import NotificationsPop from './components/Notifications'
import Shortcuts from './components/Shortcuts'
import SearchModal from './components/SearchModal'

export default function App() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('board')
  const [openTaskId, setOpenTaskId] = useState(null)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === '1')
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    api.get('/tasks').then(setTasks).catch(console.error)
    api.get('/notifications').then(setNotifs).catch(console.error)
  }, [])

  // WebSocket
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onCreated = (t) => setTasks(ts => ts.some(x => x.id === t.id) ? ts : [t, ...ts])
    const onUpdated = (t) => setTasks(ts => ts.map(x => x.id === t.id ? t : x))
    const onDeleted = ({ id }) => setTasks(ts => ts.filter(x => x.id !== id))
    const onMoved = ({ id, status }) => setTasks(ts => ts.map(x => x.id === id ? { ...x, status } : x))
    const onNotif = (n) => setNotifs(ns => [n, ...ns])
    socket.on('task:created', onCreated)
    socket.on('task:updated', onUpdated)
    socket.on('task:deleted', onDeleted)
    socket.on('task:moved', onMoved)
    socket.on('notification:new', onNotif)
    return () => {
      socket.off('task:created', onCreated)
      socket.off('task:updated', onUpdated)
      socket.off('task:deleted', onDeleted)
      socket.off('task:moved', onMoved)
      socket.off('notification:new', onNotif)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s) }
      else if (meta && e.key === '/') { e.preventDefault(); setShortcutsOpen(s => !s) }
      else if (meta && e.key === '.') { e.preventDefault(); setDark(d => !d) }
      else if (e.key === 'g') {
        const next = (e2) => {
          if (e2.key === 'b') { setView('board'); document.removeEventListener('keydown', next) }
          if (e2.key === 't') { setView('table'); document.removeEventListener('keydown', next) }
        }
        document.addEventListener('keydown', next, { once: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleTaskUpdate = useCallback((updated) => {
    setTasks(ts => ts.map(t => t.id === updated.id ? updated : t))
  }, [])

  const handleNotifClick = async (taskId, notifId) => {
    try { await api.patch(`/notifications/${notifId}/read`) } catch {}
    setNotifs(ns => ns.map(n => n.id === notifId ? { ...n, read: true } : n))
    setNotifsOpen(false)
    if (taskId) { if (view === 'audit') setView('board'); setOpenTaskId(taskId) }
  }

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all') } catch {}
    setNotifs(ns => ns.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const showToast = (msg, icon = 'check') => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 2000)
  }

  const placeholderView = ['inbox', 'myweek', 'starred', 'members', 'settings'].includes(view)

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} onShortcuts={() => setShortcutsOpen(true)} onSearch={() => setSearchOpen(true)} />

      <div className="main">
        <div className="top">
          <div className="crumbs">
            <span>Workspace</span>
            <span className="sep">/</span>
            <span>Product team</span>
            <span className="sep">/</span>
            <strong>{view === 'audit' ? 'Audit log' : view === 'table' ? 'All tasks' : 'Sprint 18'}</strong>
          </div>

          {view !== 'audit' && !placeholderView && (
            <div className="seg" data-tour-views>
              <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>
                <Icon name="grid" /> Board
              </button>
              <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
                <Icon name="table" /> Table
              </button>
            </div>
          )}

          <div className="top-spacer" />

          <button className="icbtn" title="Filter"><Icon name="filter" /></button>

          <div style={{ position: 'relative' }}>
            <button data-notif-btn className="icbtn" title="Notifications" onClick={() => setNotifsOpen(o => !o)}>
              <Icon name="bell" />
              {unreadCount > 0 && <span className="badge" />}
            </button>
            {notifsOpen && (
              <NotificationsPop
                notifs={notifs}
                onClose={() => setNotifsOpen(false)}
                onClick={handleNotifClick}
                markAllRead={markAllRead}
              />
            )}
          </div>

          <button className="icbtn" title="Toggle theme" onClick={() => setDark(d => !d)}>
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>

          <button className="btn btn-primary" data-tour-newtask onClick={() => showToast('Choose a column and click + to add a task', 'plus')}>
            <Icon name="plus" /> New task
          </button>
        </div>

        {view !== 'audit' && !placeholderView && (
          <div className="board-head">
            <div className="board-title-wrap">
              <div className="board-title">Sprint 18 <em>·</em> Product</div>
              <div className="board-sub">
                <span className="meta"><Icon name="cal" style={{ width: 12, height: 12 }} /> May 2026</span>
                <span className="meta"><span className="dot" /> {tasks.length} tasks</span>
              </div>
            </div>
            <div className="board-tools">
              <button className="btn btn-ghost"><Icon name="sort" /> Sort</button>
              <button className="btn btn-ghost"><Icon name="settings" /></button>
            </div>
          </div>
        )}

        {view === 'board' && <Board tasks={tasks} setTasks={setTasks} onOpen={setOpenTaskId} dark={dark} />}
        {view === 'table' && <TableView tasks={tasks} onOpen={setOpenTaskId} dark={dark} />}
        {view === 'audit' && <AuditView />}

        {placeholderView && (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.012em', marginBottom: 8 }}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </div>
              <div style={{ fontSize: 13 }}>Coming soon.</div>
              <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setView('board')}>← Back to board</button>
            </div>
          </div>
        )}
      </div>

      <div className="mob-tabs">
        <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Icon name="grid" /><span>Board</span></button>
        <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}><Icon name="table" /><span>Table</span></button>
        <button className={notifsOpen ? 'on' : ''} onClick={() => setNotifsOpen(o => !o)} data-notif-btn><Icon name="bell" /><span>Inbox</span></button>
        <button className={view === 'audit' ? 'on' : ''} onClick={() => setView('audit')}><Icon name="log" /><span>Audit</span></button>
      </div>

      {openTaskId && (
        <TaskModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onUpdate={handleTaskUpdate} dark={dark} />
      )}
      {shortcutsOpen && <Shortcuts onClose={() => setShortcutsOpen(false)} />}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onOpenTask={(id) => { setOpenTaskId(id); if (view === 'audit') setView('board') }} />}

      {toast && (
        <div className="toast-wrap">
          <div className="toast"><Icon name={toast.icon || 'check'} /> {toast.msg}</div>
        </div>
      )}
    </div>
  )
}
