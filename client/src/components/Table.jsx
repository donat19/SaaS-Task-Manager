import { Tag, StatusPill, PriorityPill, Avatars } from './Atoms'
import Icon from './Icon'

export default function TableView({ tasks, onOpen, dark }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 72 }}>ID</th>
            <th>Task</th>
            <th style={{ width: 130 }}>Status</th>
            <th style={{ width: 100 }}>Priority</th>
            <th style={{ width: 110 }}>Due</th>
            <th style={{ width: 130 }}>Assignees</th>
            <th style={{ width: 80, textAlign: 'right' }}>Activity</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} onClick={() => onOpen(t.id)}>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>STR-{t.id}</td>
              <td className="title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{t.title}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {t.tags?.map(tt => <Tag key={tt.tagId} tag={tt.tag} dark={dark} />)}
                  </div>
                </div>
              </td>
              <td><StatusPill status={t.status} dark={dark} /></td>
              <td><PriorityPill priority={t.priority} /></td>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </td>
              <td><Avatars users={t.assignees?.map(a => a.user) || []} size={20} /></td>
              <td style={{ textAlign: 'right', color: 'var(--ink-3)', fontSize: 11.5 }}>
                {t._count?.comments > 0 && <span style={{ marginRight: 8 }}><Icon name="msg" size={11} /> {t._count.comments}</span>}
                {t._count?.attachments > 0 && <span><Icon name="paperclip" size={11} /> {t._count.attachments}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
