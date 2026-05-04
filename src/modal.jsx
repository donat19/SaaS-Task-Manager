// Task detail modal — comments, file upload, metadata

const TaskModal = ({ task, onClose, onUpdate, dark }) => {
  const { USERS, ME, COMMENTS_SEED, COLUMNS } = window.STRATA_DATA;
  const [comments, setComments] = React.useState(() =>
    (COMMENTS_SEED[task.id] || []).map(c => ({ ...c }))
  );
  const [draft, setDraft] = React.useState("");
  const [files, setFiles] = React.useState([
    { name: "onboard-storyboard-v2.fig", size: "4.2 MB", ext: "fig" },
    { name: "motion-spec.pdf", size: "812 KB", ext: "pdf" },
  ].slice(0, task.files));
  const [dropOver, setDropOver] = React.useState(false);

  const submitComment = () => {
    if (!draft.trim()) return;
    setComments(cs => [...cs, { id: `c${Date.now()}`, user: ME.id, at: "Just now", text: draft.trim() }]);
    setDraft("");
  };

  const addFiles = (list) => {
    const newOnes = Array.from(list).map(f => ({
      name: f.name,
      size: f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`,
      ext: f.name.split(".").pop().slice(0, 4),
    }));
    setFiles(fs => [...fs, ...newOnes]);
  };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-main">
          <div className="m-head">
            <span className="id">{task.id}</span>
            <StatusPill col={task.col} dark={dark} />
            <PriorityPill priority={task.priority} />
            <div className="m-head-spacer" />
            <button className="icbtn" title="Watch"><Icon name="eye" /></button>
            <button className="icbtn" title="Star"><Icon name="star" /></button>
            <button className="icbtn" title="More"><Icon name="more" /></button>
            <button className="icbtn" title="Close" onClick={onClose}><Icon name="x" /></button>
          </div>

          <h1 className="m-title" contentEditable suppressContentEditableWarning>{task.title}</h1>

          <div className="m-desc-h">Description</div>
          <div className="m-desc">
            {task.desc ? <p>{task.desc}</p> : <p style={{ color: "var(--ink-4)" }}>Add a description…</p>}
            {task.id === "STR-142" && (
              <>
                <p>Three story beats:</p>
                <ul>
                  <li>Empty board — sample columns appear with a layered fade-in (offset blocks, matching the brand mark)</li>
                  <li>Drag demo — ghost cursor pulls a card across; success haptic on snap</li>
                  <li>First task — inline-add affordance pulses; confetti is <em>not</em> appropriate for our brand</li>
                </ul>
                <p>Reference: <code>tokens.motion.spring</code>, ease curve from the Linear acquisition deck.</p>
              </>
            )}
          </div>

          <div className="m-cmts">
            <div className="m-side-h" style={{ marginBottom: 4 }}>Activity · {comments.length} comments</div>
            {comments.map(c => {
              const u = USERS.find(x => x.id === c.user);
              return (
                <div className="m-cmt" key={c.id}>
                  <Avatar user={u} size={28} />
                  <div className="m-cmt-body">
                    <div className="m-cmt-h">
                      <b>{u.name}</b>
                      <time>{c.at}</time>
                    </div>
                    <div className="m-cmt-text">{c.text}</div>
                  </div>
                </div>
              );
            })}
            <div className="m-cmt-form">
              <Avatar user={ME} size={28} />
              <textarea
                placeholder="Write a comment… ⌘⏎ to send"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
              />
            </div>
            {draft && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <button className="btn btn-ghost" onClick={() => setDraft("")}>Cancel</button>
                <button className="btn btn-primary" onClick={submitComment}>Comment</button>
              </div>
            )}
          </div>
        </div>

        <div className="m-side">
          <div>
            <div className="m-side-h">Properties</div>
            <div className="m-meta-row">
              <span className="m-meta-lbl"><Icon name="user" /> Assignees</span>
              <Avatars ids={task.assignees} size={22} />
            </div>
            <div className="m-meta-row">
              <span className="m-meta-lbl"><Icon name="layers" /> Status</span>
              <select className="twk-field" style={{ height: 26, fontSize: 12, background: "var(--bg-elev)", border: "1px solid var(--line)", color: "var(--ink)", borderRadius: 6 }}
                      value={task.col} onChange={(e) => onUpdate({ col: e.target.value })}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="m-meta-row">
              <span className="m-meta-lbl"><Icon name="flag" /> Priority</span>
              <PriorityPill priority={task.priority} />
            </div>
            <div className="m-meta-row">
              <span className="m-meta-lbl"><Icon name="cal" /> Due</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{task.due}, 2026</span>
            </div>
            <div className="m-meta-row">
              <span className="m-meta-lbl"><Icon name="grid" /> Tags</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {task.tags.map(t => <Tag key={t} tag={t} dark={dark} />)}
              </div>
            </div>
          </div>

          <div>
            <div className="m-side-h">Files · {files.length}</div>
            <div className="m-files">
              {files.map((f, i) => (
                <div className="m-file" key={i}>
                  <div className="m-file-ic">{f.ext.toUpperCase()}</div>
                  <div className="m-file-name">{f.name}</div>
                  <div className="m-file-size">{f.size}</div>
                  <button className="m-file-x" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}><Icon name="x" size={11} /></button>
                </div>
              ))}
            </div>
            <label
              className={`m-drop ${dropOver ? "over" : ""}`}
              style={{ marginTop: 6, display: "block" }}
              onDragOver={(e) => { e.preventDefault(); setDropOver(true); }}
              onDragLeave={() => setDropOver(false)}
              onDrop={(e) => { e.preventDefault(); setDropOver(false); addFiles(e.dataTransfer.files); }}
            >
              <Icon name="upload" style={{ width: 14, height: 14, display: "block", margin: "0 auto 4px", color: "var(--ink-3)" }} />
              <div>Drop files or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>browse</span></div>
              <input type="file" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>

          <div>
            <div className="m-side-h">Watchers · {task.assignees.length}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <Avatars ids={task.assignees} size={22} />
              <button className="icbtn" style={{ width: 22, height: 22, border: "1px dashed var(--line)" }} title="Add"><Icon name="plus" size={11} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.TaskModal = TaskModal;
