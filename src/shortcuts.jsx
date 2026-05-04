// Keyboard shortcuts overlay

const Shortcuts = ({ onClose }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const groups = [
    ["Navigation", [
      ["⌘ K", "Search & jump to anything"],
      ["G then B", "Go to board"],
      ["G then T", "Go to table"],
      ["G then A", "Go to audit log"],
    ]],
    ["Tasks", [
      ["N", "New task"],
      ["E", "Edit selected task"],
      ["⏎", "Open task"],
      ["⌘ ⏎", "Send comment"],
    ]],
    ["View", [
      ["⌘ \\", "Toggle sidebar"],
      ["⌘ .", "Toggle dark mode"],
      ["⌘ /", "Show this overlay"],
      ["?", "What's new"],
    ]],
    ["Drag & drop", [
      ["Hold ⇧", "Drag column"],
      ["Hold ⌥", "Duplicate while drag"],
      ["Esc", "Cancel drag"],
      ["←/→", "Move card columns"],
    ]],
  ];
  return (
    <div className="ks-scrim" onClick={onClose}>
      <div className="ks" onClick={e => e.stopPropagation()}>
        <h2>Keyboard <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>shortcuts</em></h2>
        <div className="ks-grid">
          {groups.map(([title, rows]) => (
            <React.Fragment key={title}>
              <div className="ks-grp">{title}</div>
              {rows.map(([k, label], i) => (
                <div className="ks-row" key={i}>
                  <span>{label}</span>
                  <kbd>{k}</kbd>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Shortcuts = Shortcuts;
