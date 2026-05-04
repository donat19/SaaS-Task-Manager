import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './context/AuthContext'
import { getSocket } from './lib/socket'
import api from './lib/api'

import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import TableView from './components/Table'
import TaskModal from './components/Modal'
import AuditView from './components/Audit'
import NotificationsPop from './components/Notifications'
import Shortcuts from './components/Shortcuts'
import SearchModal from './components/SearchModal'
import NewTaskModal from './components/NewTaskModal'

export default function App() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('board')
  const [openTaskId, setOpenTaskId] = useState(null)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState(null)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === '1')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    api.get('/tasks').then(setTasks).catch(console.error)
    api.get('/notifications').then(setNotifs).catch(console.error)
  }, [])

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
      else if (e.key === 'n' && !e.target.closest('input,textarea,[contenteditable]')) {
        setNewTaskStatus(null); setNewTaskOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleTaskUpdate = useCallback((updated) => {
    setTasks(ts => ts.map(t => t.id === updated.id ? updated : t))
  }, [])

  const handleTaskCreated = useCallback((task) => {
    setTasks(ts => ts.some(x => x.id === task.id) ? ts : [task, ...ts])
    setNewTaskOpen(false)
    showToast('Task created')
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

  const showToast = (msg, icon = 'check') => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 2000)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  // dynamic stats
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0

  const viewLabel = view === 'audit' ? 'Audit log' : view === 'table' ? 'All tasks' : 'Board'

  return (
    <div className="app">
      <Sidebar
        view={view}
        setView={setView}
        onShortcuts={() => setShortcutsOpen(true)}
        onSearch={() => setSearchOpen(true)}
        taskCount={tasks.length}
        unreadCount={unreadCount}
      />

      <div className="main">
        {/* Topbar */}
        <div className="top">
          <div className="crumbs">
            <span>{user?.name}</span>
            <span className="sep">/</span>
            <strong>{viewLabel}</strong>
          </div>

          {view !== 'audit' && (
            <div className="seg">
              <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>
                <Icon name="grid" /> Board
              </button>
              <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
                <Icon name="table" /> Table
              </button>
            </div>
          )}

          <div className="top-spacer" />

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

          <button className="btn btn-primary" onClick={() => setNewTaskOpen(true)}>
            <Icon name="plus" /> New task
          </button>
        </div>

        {/* Board header — only for board/table views */}
        {view !== 'audit' && (
          <div className="board-head">
            <div className="board-title-wrap">
              <div className="board-title">
                {user?.name?.split(' ')[0]}'s workspace <em>·</em> {tasks.length > 0 ? 'Active' : 'Empty'}
              </div>
              <div className="board-sub">
                <span className="meta">
                  <Icon name="cal" style={{ width: 12, height: 12 }} /> {monthYear}
                </span>
                <span className="meta">
                  <span className="dot" /> {tasks.length} tasks
                </span>
                {tasks.length > 0 && (
                  <span className="meta">
                    <Icon name="activity" style={{ width: 12, height: 12 }} /> {progress}% done
                  </span>
                )}
              </div>
            </div>
            <div className="board-tools">
              <button className="btn btn-ghost" onClick={() => setNewTaskOpen(true)}>
                <Icon name="plus" /> New task
              </button>
            </div>
          </div>
        )}

        {view === 'board' && <Board tasks={tasks} setTasks={setTasks} onOpen={setOpenTaskId} dark={dark} onNewTask={(status) => { setNewTaskStatus(status); setNewTaskOpen(true) }} />}
        {view === 'table' && <TableView tasks={tasks} onOpen={setOpenTaskId} dark={dark} />}
        {view === 'audit' && <AuditView />}
      </div>

      {/* Mobile bottom tabs */}
      <div className="mob-tabs">
        <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Icon name="grid" /><span>Board</span></button>
        <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}><Icon name="table" /><span>Table</span></button>
        <button className={notifsOpen ? 'on' : ''} onClick={() => setNotifsOpen(o => !o)} data-notif-btn>
          <Icon name="bell" /><span>Inbox</span>
          {unreadCount > 0 && <span className="badge" style={{ position: 'absolute', top: 6, right: 8 }} />}
        </button>
        {user?.role === 'admin' && (
          <button className={view === 'audit' ? 'on' : ''} onClick={() => setView('audit')}><Icon name="log" /><span>Audit</span></button>
        )}
      </div>

      {openTaskId && (
        <TaskModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onUpdate={handleTaskUpdate} dark={dark} />
      )}
      {newTaskOpen && (
        <NewTaskModal onClose={() => { setNewTaskOpen(false); setNewTaskStatus(null) }} onCreated={handleTaskCreated} dark={dark} initialStatus={newTaskStatus} />
      )}
      {shortcutsOpen && <Shortcuts onClose={() => setShortcutsOpen(false)} />}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onOpenTask={(id) => { setOpenTaskId(id); if (view === 'audit') setView('board') }}
        />
      )}

      {toast && (
        <div className="toast-wrap">
          <div className="toast"><Icon name={toast.icon || 'check'} /> {toast.msg}</div>
        </div>
      )}
    </div>
  )
}
