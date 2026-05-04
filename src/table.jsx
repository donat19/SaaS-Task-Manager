// Table view

const TableView = ({ tasks, onOpen, dark }) => {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 92 }}>ID</th>
            <th>Task</th>
            <th style={{ width: 130 }}>Status</th>
            <th style={{ width: 100 }}>Priority</th>
            <th style={{ width: 110 }}>Due</th>
            <th style={{ width: 130 }}>Assignees</th>
            <th style={{ width: 80, textAlign: "right" }}>Activity</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} onClick={() => onOpen(t.id)}>
              <td style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{t.id}</td>
              <td className="title">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{t.title}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {t.tags.map(tag => <Tag key={tag} tag={tag} dark={dark} />)}
                  </div>
                </div>
              </td>
              <td><StatusPill col={t.col} dark={dark} /></td>
              <td><PriorityPill priority={t.priority} /></td>
              <td style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{t.due}</td>
              <td><Avatars ids={t.assignees} size={20} /></td>
              <td style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 11.5 }}>
                {t.comments > 0 && <span style={{ marginRight: 8 }}>💬{t.comments}</span>}
                {t.files > 0 && <span>📎{t.files}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

window.TableView = TableView;
