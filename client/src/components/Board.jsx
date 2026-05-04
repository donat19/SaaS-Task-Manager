import { useState, useRef } from 'react'
import Icon from './Icon'
import { Tag, Avatars, COLUMNS } from './Atoms'
import api from '../lib/api'

function Card({ task, onOpen, onDragStart, onDragEnd, dragging, dark }) {
  const today = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isLate = dueDate && dueDate < today && task.status !== 'done'

  return (
    <div
      className={`card ${dragging ? 'dragging' : ''} priority-${task.priority}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id) }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task.id)}
    >
      <div className="card-id">STR-{task.id}</div>
      {task.tags?.length > 0 && (
        <div className="card-tags">
          {task.tags.map(tt => <Tag key={tt.tagId} tag={tt.tag} dark={dark} />)}
        </div>
      )}
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-desc">{task.description}</div>}
      <div className="card-foot">
        {dueDate && (
          <span className={`meta due ${isLate ? 'late' : ''}`}>
            <Icon name="cal" /> {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task._count?.comments > 0 && (
          <span className="meta"><Icon name="msg" /> {task._count.comments}</span>
        )}
        {task._count?.attachments > 0 && (
          <span className="meta"><Icon name="paperclip" /> {task._count.attachments}</span>
        )}
        <div className="spacer" />
        <Avatars users={task.assignees?.map(a => a.user) || []} size={20} />
      </div>
    </div>
  )
}

function Column({ col, tasks, onOpen, onDrop, onDragStart, onDragEnd, draggingId, dark, onAdd }) {
  const [over, setOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const startAdd = () => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0) }

  const submit = async () => {
    if (draft.trim()) await onAdd(col.id, draft.trim())
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="col">
      <div className="col-hd">
        <span className="swatch" style={{ background: col.color }} />
        <span className="col-hd-title">{col.title}</span>
        <span className="col-hd-count">{tasks.length}</span>
        <div className="col-hd-spacer" />
        <button className="col-hd-act" title="Add task" onClick={startAdd}><Icon name="plus" /></button>
        <button className="col-hd-act" title="More"><Icon name="more" /></button>
      </div>
      <div
        className={`col-body ${over ? 'over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!over) setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onDrop(col.id) }}
      >
        {tasks.map(t => (
          <Card key={t.id} task={t} onOpen={onOpen}
            onDragStart={onDragStart} onDragEnd={onDragEnd}
            dragging={draggingId === t.id} dark={dark} />
        ))}
        {adding ? (
          <div className="col-add-form">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Title for the new task…"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
                if (e.key === 'Escape') { setAdding(false); setDraft('') }
              }}
            />
            <div className="col-add-form-row">
              <button className="btn btn-primary" onClick={submit}>Add task</button>
              <button className="btn btn-ghost" onClick={() => { setAdding(false); setDraft('') }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="col-add" onClick={startAdd}><Icon name="plus" /> New task</button>
        )}
      </div>
    </div>
  )
}

export default function Board({ tasks, setTasks, onOpen, dark }) {
  const [draggingId, setDraggingId] = useState(null)

  const onDrop = async (status) => {
    if (!draggingId) return
    const id = draggingId
    setDraggingId(null)
    // optimistic update — socket event will confirm
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    try {
      await api.patch(`/tasks/${id}/status`, { status })
    } catch (e) {
      console.error(e)
    }
  }

  const onAdd = async (status, title) => {
    try {
      const task = await api.post('/tasks', { title, status })
      setTasks(ts => [...ts, task])
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="kanban">
      <div className="columns">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            tasks={tasks.filter(t => t.status === col.id)}
            onOpen={onOpen}
            onDrop={onDrop}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            draggingId={draggingId}
            dark={dark}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  )
}
