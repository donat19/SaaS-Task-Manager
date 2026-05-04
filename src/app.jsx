// Main app — composes everything

const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accentHue": 280,
  "density": "comfortable",
  "showOnboarding": true,
  "compactCards": false,
  "view": "board"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tasks, setTasks] = useState(window.STRATA_DATA.TASK_SEED);
  const [view, setView] = useState(t.view || "board");
  const [openTaskId, setOpenTaskId] = useState(null);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifs, setNotifs] = useState(window.STRATA_DATA.NOTIFICATIONS_SEED);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tipStep, setTipStep] = useState(t.showOnboarding ? 1 : 0);
  const [toast, setToast] = useState(null);

  const dark = t.dark;

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.setProperty("--accent", `oklch(${dark ? 0.72 : 0.55} 0.16 ${t.accentHue})`);
    document.documentElement.style.setProperty("--accent-soft", `oklch(${dark ? 0.28 : 0.96} ${dark ? 0.06 : 0.025} ${t.accentHue})`);
    document.documentElement.style.setProperty("--accent-ink", `oklch(${dark ? 0.85 : 0.4} ${dark ? 0.14 : 0.18} ${t.accentHue})`);
  }, [dark, t.accentHue]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "/") { e.preventDefault(); setShortcutsOpen(s => !s); }
      else if (meta && e.key === ".") { e.preventDefault(); setTweak("dark", !dark); }
      else if (e.key === "n" && !e.target.closest("input,textarea,[contenteditable]")) {
        // No-op — would open new task; for prototype just toast
        setToast({ msg: "Press + on a column to create a task", icon: "plus" });
        setTimeout(() => setToast(null), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dark, setTweak]);

  const openTask = useMemo(() => tasks.find(x => x.id === openTaskId), [tasks, openTaskId]);

  const updateTask = (patch) => {
    setTasks(ts => ts.map(t => t.id === openTaskId ? { ...t, ...patch } : t));
  };

  const handleNotifClick = (taskId, notifId) => {
    setNotifs(ns => ns.map(n => n.id === notifId ? { ...n, unread: false } : n));
    setNotifsOpen(false);
    if (taskId) {
      // jump to board if needed
      if (view === "audit") setView("board");
      setOpenTaskId(taskId);
    }
  };

  const unreadCount = notifs.filter(n => n.unread).length;
  const me = window.STRATA_DATA.ME;

  return (
    <div className="app">
      <Sidebar view={view} setView={(v) => { setView(v); setTweak("view", v); }} onShortcuts={() => setShortcutsOpen(true)} />

      <div className="main">
        <div className="top">
          <div className="crumbs">
            <span>Workspace</span>
            <span className="sep">/</span>
            <span>Product team</span>
            <span className="sep">/</span>
            <strong>{view === "audit" ? "Audit log" : view === "table" ? "All tasks" : "Sprint 18"}</strong>
          </div>

          {view !== "audit" && (
            <div className="seg" data-tour-views>
              <button className={view === "board" ? "on" : ""} onClick={() => setView("board")}>
                <Icon name="grid" /> Board
              </button>
              <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}>
                <Icon name="table" /> Table
              </button>
            </div>
          )}

          <div className="top-spacer" />

          <div className="presence" title="3 teammates active now">
            {window.STRATA_DATA.USERS.slice(0, 4).map(u => <Avatar key={u.id} user={u} size={24} style={{ border: "2px solid var(--bg)" }} />)}
            <div className="more">+2</div>
          </div>

          <button className="icbtn" title="Filter"><Icon name="filter" /></button>

          <div style={{ position: "relative" }}>
            <button data-notif-btn className="icbtn" title="Notifications" onClick={() => setNotifsOpen(o => !o)}>
              <Icon name="bell" />
              {unreadCount > 0 && <span className="badge" />}
            </button>
            {notifsOpen && <NotificationsPop notifs={notifs} onClose={() => setNotifsOpen(false)} onClick={handleNotifClick} markAllRead={() => setNotifs(ns => ns.map(n => ({ ...n, unread: false })))} />}
          </div>

          <button className="icbtn" title="Toggle theme" onClick={() => setTweak("dark", !dark)}>
            <Icon name={dark ? "sun" : "moon"} />
          </button>

          <button className="btn btn-primary" data-tour-newtask>
            <Icon name="plus" /> New task
          </button>
        </div>

        {view !== "audit" && (
          <div className="board-head">
            <div className="board-title-wrap">
              <div className="board-title">
                Sprint 18 <em>·</em> Layered onboarding
              </div>
              <div className="board-sub">
                <span className="meta"><Icon name="cal" style={{ width: 12, height: 12 }} /> Apr 28 — May 11</span>
                <span className="meta"><span className="dot"></span> 12 tasks</span>
                <span className="meta"><Icon name="wifi" style={{ width: 12, height: 12, color: "var(--status-done)" }} /> 4 syncing</span>
                <span className="meta"><Icon name="activity" style={{ width: 12, height: 12 }} /> 67% on track</span>
              </div>
            </div>
            <div className="board-tools">
              <span className="chip">Group: <b style={{ fontWeight: 550, color: "var(--ink)" }}>Status</b></span>
              <span className="chip">2 filters <Icon name="x" className="chip-x" /></span>
              <button className="btn btn-ghost"><Icon name="sort" /> Sort</button>
              <button className="btn btn-ghost"><Icon name="settings" /></button>
            </div>
          </div>
        )}

        {view === "board" && <Board tasks={tasks} setTasks={setTasks} onOpen={setOpenTaskId} dark={dark} />}
        {view === "table" && <TableView tasks={tasks} onOpen={setOpenTaskId} dark={dark} />}
        {view === "audit" && <AuditView />}
        {(view === "members" || view === "settings" || view === "inbox" || view === "myweek" || view === "starred") && (
          <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--ink-3)", padding: 40 }}>
            <div style={{ textAlign: "center", maxWidth: 360 }}>
              <div style={{ width: 60, height: 60, margin: "0 auto 16px", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "var(--ink)", borderRadius: 12, transform: "translate(-4px,-4px)", opacity: 0.1 }} />
                <div style={{ position: "absolute", inset: 0, background: "var(--accent)", borderRadius: 12, transform: "translate(4px,4px)", opacity: 0.2 }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.012em" }}>{view.charAt(0).toUpperCase() + view.slice(1)}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>This view is wired up but out of scope for the prototype. Click a board to return.</div>
              <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setView("board")}>← Back to board</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom tabs */}
      <div className="mob-tabs">
        <button className={view === "board" ? "on" : ""} onClick={() => setView("board")}><Icon name="grid" /><span>Board</span></button>
        <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}><Icon name="table" /><span>Table</span></button>
        <button className={notifsOpen ? "on" : ""} onClick={() => setNotifsOpen(o => !o)} data-notif-btn><Icon name="bell" /><span>Inbox</span></button>
        <button className={view === "audit" ? "on" : ""} onClick={() => setView("audit")}><Icon name="log" /><span>Audit</span></button>
      </div>

      {openTask && <TaskModal task={openTask} onClose={() => setOpenTaskId(null)} onUpdate={updateTask} dark={dark} />}
      {shortcutsOpen && <Shortcuts onClose={() => setShortcutsOpen(false)} />}

      {/* Onboarding tour */}
      {tipStep === 1 && (
        <OnboardingTip step={1} total={3} anchor="[data-tour-views]" placement="bottom"
          title="Two views, one truth"
          body="Toggle between kanban and table — same tasks, different lens. Try Table for filtering across columns."
          onNext={() => setTipStep(2)} onSkip={() => { setTipStep(0); setTweak("showOnboarding", false); }} />
      )}
      {tipStep === 2 && (
        <OnboardingTip step={2} total={3} anchor=".col" placement="bottom"
          title="Drag cards between columns"
          body="Status updates instantly. Teammates see changes live via websocket — try it with the placeholder cards."
          onNext={() => setTipStep(3)} onSkip={() => { setTipStep(0); setTweak("showOnboarding", false); }} />
      )}
      {tipStep === 3 && (
        <OnboardingTip step={3} total={3} anchor="[data-tour-newtask]" placement="bottom"
          title="Capture work fast"
          body="Press N anywhere, or hit + on a column. Files, mentions, and comments are all keyboard-first."
          onNext={() => { setTipStep(0); setTweak("showOnboarding", false); }} onSkip={() => { setTipStep(0); setTweak("showOnboarding", false); }} />
      )}

      {toast && (
        <div className="toast-wrap">
          <div className="toast"><Icon name={toast.icon || "check"} /> {toast.msg}</div>
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakSlider label="Accent hue" value={t.accentHue} min={0} max={360} step={5} unit="°" onChange={(v) => setTweak("accentHue", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact","comfortable"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Tour" />
        <TweakButton label="Replay onboarding" onClick={() => setTipStep(1)} />
        <TweakButton label="Open shortcuts overlay" onClick={() => setShortcutsOpen(true)} />
        <TweakButton label="Open audit log (admin)" onClick={() => setView("audit")} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
