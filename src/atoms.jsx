// Atom components — Avatar, Tag, Pill, etc.

const Avatar = ({ user, size = 24, style }) => {
  const dim = { width: size, height: size, fontSize: Math.round(size * 0.4), background: user.color, ...style };
  return <div className="av" style={dim} title={user.name}>{user.initials}</div>;
};

const Tag = ({ tag, dark }) => {
  const { TAGS, TAGS_DARK } = window.STRATA_DATA;
  const t = TAGS[tag];
  if (!t) return null;
  const d = dark ? TAGS_DARK[tag] : null;
  const bg = d ? d.bg : t.bg;
  const fg = d ? d.fg : t.fg;
  return <span className="tag" style={{ background: bg, color: fg }}>{t.label}</span>;
};

const StatusPill = ({ col, dark }) => {
  const { COLUMNS } = window.STRATA_DATA;
  const c = COLUMNS.find(x => x.id === col);
  if (!c) return null;
  const bg = dark ? `oklch(from ${c.color} 0.28 0.06 h)` : `oklch(from ${c.color} 0.95 0.04 h)`;
  const fg = dark ? `oklch(from ${c.color} 0.85 0.12 h)` : `oklch(from ${c.color} 0.4 0.15 h)`;
  return <span className="pill" style={{ background: bg, color: fg }}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }} /> {c.title}
  </span>;
};

const PriorityPill = ({ priority, dark }) => {
  const map = {
    high: { c: "oklch(0.62 0.16 25)", l: "High" },
    med:  { c: "oklch(0.65 0.13 80)", l: "Medium" },
    low:  { c: "oklch(0.65 0.04 220)", l: "Low" },
  };
  const m = map[priority] || map.low;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-2)" }}>
    <span style={{ width: 7, height: 7, borderRadius: 2, background: m.c }} /> {m.l}
  </span>;
};

const Avatars = ({ ids, size = 22 }) => {
  const { USERS } = window.STRATA_DATA;
  const users = ids.map(id => USERS.find(u => u.id === id)).filter(Boolean);
  return (
    <div style={{ display: "flex" }}>
      {users.map((u, i) => (
        <div key={u.id} style={{ marginLeft: i ? -6 : 0, border: "1.5px solid var(--bg-elev)", borderRadius: "50%" }}>
          <Avatar user={u} size={size} />
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { Avatar, Tag, StatusPill, PriorityPill, Avatars });
