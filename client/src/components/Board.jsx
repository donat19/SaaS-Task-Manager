import { useState } from 'react'
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

  return (
    <div className="col">
      <div className="col-hd">
        <span className="swatch" style={{ background: col.color }} />
        <span className="col-hd-title">{col.title}</span>
        <span className="col-hd-count">{tasks.length}</span>
        <div className="col-hd-spacer" />
        <button className="col-hd-act" title="Add task" onClick={() => onAdd(col.id)}><Icon name="plus" /></button>
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
        <button className="col-add" onClick={() => onAdd(col.id)}><Icon name="plus" /> New task</button>
      </div>
    </div>
  )
}

export default function Board({ tasks, setTasks, onOpen, dark, onNewTask }) {
  const [draggingId, setDraggingId] = useState(null)

  const onDrop = async (status) => {
    if (!draggingId) return
    const id = draggingId
    setDraggingId(null)
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    try {
      await api.patch(`/tasks/${id}/status`, { status })
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
            onAdd={(status) => onNewTask(status)}
          />
        ))}
      </div>
    </div>
  )
}
