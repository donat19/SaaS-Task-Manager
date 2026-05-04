// Sidebar component

const Sidebar = ({ view, setView, onShortcuts }) => {
  const { ME } = window.STRATA_DATA;
  const items = [
    { id: "inbox", label: "Inbox", icon: "inbox", count: 3 },
    { id: "myweek", label: "My week", icon: "cal", count: 7 },
    { id: "starred", label: "Starred", icon: "star" },
  ];
  const boards = [
    { id: "board", label: "Product team", color: "oklch(0.6 0.14 280)", count: 12, active: view === "board" || view === "table" },
    { id: "marketing", label: "Marketing Q2", color: "oklch(0.65 0.13 60)", count: 8 },
    { id: "research", label: "User research", color: "oklch(0.6 0.14 150)", count: 5 },
    { id: "ops", label: "Ops & infra", color: "oklch(0.6 0.13 220)", count: 3 },
  ];
  const admin = [
    { id: "audit", label: "Audit log", icon: "log" },
    { id: "members", label: "Members", icon: "user" },
    { id: "settings", label: "Workspace", icon: "settings" },
  ];

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark" />
        <div className="sb-name">Strat<em>a</em></div>
      </div>
      <div className="sb-search">
        <div className="sb-search-in">
          <Icon name="search" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </div>
      </div>

      <div className="sb-list">
        {items.map(it => (
          <div key={it.id} className="sb-item">
            <Icon name={it.icon} />
            <span>{it.label}</span>
            {it.count != null && <span className="count">{it.count}</span>}
          </div>
        ))}
      </div>

      <div className="sb-sect"><span>Boards</span><button title="New board"><Icon name="plus" size={12} /></button></div>
      <div className="sb-list">
        {boards.map(b => (
          <div key={b.id}
               className={`sb-item ${b.active ? "active" : ""}`}
               onClick={() => b.id === "board" && setView("board")}>
            <span className="sb-dot" style={{ background: b.color }} />
            <span>{b.label}</span>
            <span className="count">{b.count}</span>
          </div>
        ))}
      </div>

      <div className="sb-sect"><span>Admin</span></div>
      <div className="sb-list">
        {admin.map(it => (
          <div key={it.id}
               className={`sb-item ${view === it.id ? "active" : ""}`}
               onClick={() => setView(it.id)}>
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </div>
        ))}
        <div className="sb-item" onClick={onShortcuts}>
          <Icon name="cmd" />
          <span>Shortcuts</span>
          <span className="count" style={{ fontFamily: "var(--mono)" }}>⌘/</span>
        </div>
      </div>

      <div className="sb-foot">
        <Avatar user={ME} size={28} />
        <div className="sb-me">
          <div className="sb-me-name">{ME.name}</div>
          <div className="sb-me-role">{ME.role}@strata</div>
        </div>
        <Icon name="chev" style={{ color: "var(--ink-4)", transform: "rotate(90deg)", width: 13, height: 13 }} />
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
