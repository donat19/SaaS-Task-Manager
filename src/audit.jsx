// Audit log view (admin)

const AuditView = () => {
  const { AUDIT_SEED, USERS } = window.STRATA_DATA;
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? AUDIT_SEED : AUDIT_SEED.filter(r => r.evt.startsWith(filter));

  const evtColor = (evt) => {
    if (evt.startsWith("auth")) return "oklch(0.6 0.14 220)";
    if (evt.startsWith("task.create") || evt.startsWith("task.move") || evt.startsWith("task.update")) return "oklch(0.6 0.13 60)";
    if (evt.startsWith("task.delete")) return "oklch(0.6 0.16 25)";
    if (evt.startsWith("role") || evt.startsWith("settings")) return "oklch(0.6 0.14 280)";
    if (evt.startsWith("file")) return "oklch(0.6 0.12 150)";
    if (evt.startsWith("webhook")) return "oklch(0.55 0.005 80)";
    return "var(--ink-3)";
  };

  return (
    <div className="audit">
      <div className="audit-head">
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.018em", display: "flex", alignItems: "baseline", gap: 8 }}>
            Audit <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>log</em>
            <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--mono)", marginLeft: 6 }}>
              <Icon name="shield" style={{ width: 12, height: 12, display: "inline", marginRight: 5, verticalAlign: "-1px" }} />
              admin · 90-day retention · append-only
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
            Every state change in the workspace, immutable and signed.
          </div>
        </div>
        <div className="audit-filters">
          {["all","auth","task","file","role","settings","webhook"].map(f => (
            <button key={f} className="chip" onClick={() => setFilter(f)} style={{
              background: filter === f ? "var(--ink)" : undefined,
              color: filter === f ? "var(--bg)" : undefined,
              borderColor: filter === f ? "var(--ink)" : undefined,
              textTransform: "capitalize",
            }}>{f}</button>
          ))}
          <button className="chip"><Icon name="download" /> Export</button>
        </div>
      </div>

      <div className="audit-tbl">
        <div className="audit-hd">
          <span>Timestamp</span>
          <span>Event</span>
          <span>Actor</span>
          <span>Target</span>
        </div>
        {filtered.map((r, i) => {
          const actor = USERS.find(u => u.id === r.actor);
          return (
            <div className="audit-row" key={i}>
              <span className="audit-time">{r.at}</span>
              <span className="audit-evt">
                <span className="pill" style={{ color: evtColor(r.evt), borderColor: "currentColor" }}>{r.evt}</span>
                <b>{r.details}</b>
              </span>
              <span className="audit-actor">
                {actor ? <><Avatar user={actor} size={20} /> {actor.name}</> : <span style={{ color: "var(--ink-4)" }}>system</span>}
              </span>
              <span className="audit-target">{r.target}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.AuditView = AuditView;
