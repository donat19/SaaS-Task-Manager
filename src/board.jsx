// Kanban board with drag-and-drop

const Card = ({ task, onOpen, onDragStart, onDragEnd, dragging, dark }) => {
  const { USERS } = window.STRATA_DATA;
  const dueDate = new Date(`2026 ${task.due}`);
  const today = new Date("2026-05-04");
  const isLate = dueDate < today && task.col !== "done";

  return (
    <div
      className={`card ${dragging ? "dragging" : ""} priority-${task.priority}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(task.id); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task.id)}
    >
      <div className="card-id">{task.id}</div>
      {task.tags.length > 0 && (
        <div className="card-tags">
          {task.tags.map(t => <Tag key={t} tag={t} dark={dark} />)}
        </div>
      )}
      <div className="card-title">{task.title}</div>
      {task.desc && <div className="card-desc">{task.desc}</div>}
      {task.progress > 0 && task.progress < 100 && (
        <div className="card-progress"><div style={{ width: `${task.progress}%` }} /></div>
      )}
      <div className="card-foot">
        {task.due && (
          <span className={`meta due ${isLate ? "late" : ""}`}>
            <Icon name="cal" /> {task.due}
          </span>
        )}
        {task.comments > 0 && (
          <span className="meta"><Icon name="msg" /> {task.comments}</span>
        )}
        {task.files > 0 && (
          <span className="meta"><Icon name="paperclip" /> {task.files}</span>
        )}
        <div className="spacer" />
        <Avatars ids={task.assignees} size={20} />
      </div>
    </div>
  );
};

const Column = ({ col, tasks, onOpen, onDrop, onDragStart, onDragEnd, draggingId, dark, onAdd, addingTo, setAddingTo }) => {
  const [over, setOver] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (addingTo === col.id && inputRef.current) inputRef.current.focus();
  }, [addingTo, col.id]);

  const submit = () => {
    if (draft.trim()) {
      onAdd(col.id, draft.trim());
      setDraft("");
    }
    setAddingTo(null);
  };

  return (
    <div className="col">
      <div className="col-hd">
        <span className="swatch" style={{ background: col.color }} />
        <span className="col-hd-title">{col.title}</span>
        <span className="col-hd-count">{tasks.length}</span>
        <div className="col-hd-spacer" />
        <button className="col-hd-act" title="Add task" onClick={() => setAddingTo(col.id)}><Icon name="plus" /></button>
        <button className="col-hd-act" title="More"><Icon name="more" /></button>
      </div>
      <div
        className={`col-body ${over ? "over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); if (!over) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onDrop(col.id); }}
      >
        {tasks.map(t => (
          <Card key={t.id} task={t} onOpen={onOpen} onDragStart={onDragStart} onDragEnd={onDragEnd} dragging={draggingId === t.id} dark={dark} />
        ))}
        {addingTo === col.id ? (
          <div className="col-add-form">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Title for the new task…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                if (e.key === "Escape") { setAddingTo(null); setDraft(""); }
              }}
            />
            <div className="col-add-form-row">
              <button className="btn btn-primary" onClick={submit}>Add task</button>
              <button className="btn btn-ghost" onClick={() => { setAddingTo(null); setDraft(""); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="col-add" onClick={() => setAddingTo(col.id)}>
            <Icon name="plus" /> New task
          </button>
        )}
      </div>
    </div>
  );
};

const Board = ({ tasks, setTasks, onOpen, dark }) => {
  const { COLUMNS } = window.STRATA_DATA;
  const [draggingId, setDraggingId] = React.useState(null);
  const [addingTo, setAddingTo] = React.useState(null);

  const onDrop = (colId) => {
    if (!draggingId) return;
    setTasks(ts => ts.map(t => t.id === draggingId ? { ...t, col: colId, progress: colId === "done" ? 100 : t.progress } : t));
    setDraggingId(null);
  };

  const onAdd = (colId, title) => {
    const id = `STR-${Math.floor(Math.random() * 900) + 200}`;
    setTasks(ts => [...ts, {
      id, col: colId, title, desc: "", tags: [], priority: "med", due: "May 30",
      assignees: [window.STRATA_DATA.ME.id], comments: 0, files: 0, progress: 0,
    }]);
  };

  return (
    <div className="kanban">
      <div className="columns">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            tasks={tasks.filter(t => t.col === col.id)}
            onOpen={onOpen}
            onDrop={onDrop}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            draggingId={draggingId}
            dark={dark}
            onAdd={onAdd}
            addingTo={addingTo}
            setAddingTo={setAddingTo}
          />
        ))}
      </div>
    </div>
  );
};

window.Board = Board;
