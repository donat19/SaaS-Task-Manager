// Mock data for the Strata task manager prototype.

const USERS = [
  { id: "u1", name: "Lena Park", initials: "LP", color: "oklch(0.62 0.13 280)", role: "admin" },
  { id: "u2", name: "Mateo Ruiz", initials: "MR", color: "oklch(0.62 0.13 30)", role: "user" },
  { id: "u3", name: "Aiko Tanaka", initials: "AT", color: "oklch(0.62 0.13 150)", role: "user" },
  { id: "u4", name: "Devon King", initials: "DK", color: "oklch(0.62 0.13 220)", role: "user" },
  { id: "u5", name: "Priya Shah", initials: "PS", color: "oklch(0.62 0.13 80)", role: "user" },
  { id: "u6", name: "Noah Berg", initials: "NB", color: "oklch(0.62 0.13 320)", role: "user" },
];

const ME = USERS[0];

const TAGS = {
  design: { label: "Design", bg: "oklch(0.94 0.04 280)", fg: "oklch(0.4 0.16 280)" },
  eng:    { label: "Engineering", bg: "oklch(0.94 0.04 220)", fg: "oklch(0.4 0.16 220)" },
  mkt:    { label: "Marketing", bg: "oklch(0.94 0.05 60)",  fg: "oklch(0.42 0.16 60)" },
  ops:    { label: "Ops",     bg: "oklch(0.94 0.04 150)", fg: "oklch(0.38 0.14 150)" },
  bug:    { label: "Bug",     bg: "oklch(0.94 0.05 25)",  fg: "oklch(0.45 0.18 25)" },
  research:{label: "Research",bg: "oklch(0.94 0.04 320)", fg: "oklch(0.42 0.16 320)" },
};
// Dark variants
const TAGS_DARK = {
  design: { bg: "oklch(0.3 0.06 280)", fg: "oklch(0.85 0.12 280)" },
  eng:    { bg: "oklch(0.3 0.06 220)", fg: "oklch(0.85 0.12 220)" },
  mkt:    { bg: "oklch(0.3 0.07 60)",  fg: "oklch(0.85 0.13 60)" },
  ops:    { bg: "oklch(0.3 0.06 150)", fg: "oklch(0.82 0.12 150)" },
  bug:    { bg: "oklch(0.32 0.08 25)", fg: "oklch(0.85 0.14 25)" },
  research:{bg: "oklch(0.3 0.06 320)", fg: "oklch(0.85 0.12 320)" },
};

const COLUMNS = [
  { id: "backlog",  title: "Backlog",     color: "oklch(0.7 0.005 80)" },
  { id: "todo",     title: "To do",       color: "oklch(0.62 0.13 230)" },
  { id: "doing",    title: "In progress", color: "oklch(0.65 0.14 60)" },
  { id: "review",   title: "In review",   color: "oklch(0.6 0.14 280)" },
  { id: "done",     title: "Done",        color: "oklch(0.62 0.12 150)" },
];

const TASK_SEED = [
  { id: "STR-142", col: "doing", title: "Layered onboarding flow — first-run animation", desc: "Storyboard the three-step intro: empty board → drag demo → first task created. Use the Strata layered mark as the through-line motif.", tags: ["design"], priority: "high", due: "May 09", assignees: ["u1","u3"], comments: 4, files: 2, progress: 60 },
  { id: "STR-138", col: "doing", title: "Realtime board sync — websocket reconciliation", desc: "Resolve column-order conflicts when two users drag simultaneously. Last-write-wins with operation IDs.", tags: ["eng"], priority: "high", due: "May 06", assignees: ["u2"], comments: 12, files: 1, progress: 35 },
  { id: "STR-156", col: "todo", title: "Concept-art moodboard for Q3 brand refresh", desc: "Pull 30+ references across editorial, ambient electronic album art, and Bauhaus poster work.", tags: ["design","research"], priority: "med", due: "May 14", assignees: ["u1"], comments: 2, files: 5, progress: 0 },
  { id: "STR-160", col: "todo", title: "Switch comments to Tiptap — collab cursors", desc: "", tags: ["eng"], priority: "med", due: "May 18", assignees: ["u4","u2"], comments: 1, files: 0, progress: 0 },
  { id: "STR-164", col: "todo", title: "Audit log: filter by actor + event type", desc: "Add multiselect filter with URL persistence.", tags: ["eng"], priority: "low", due: "May 22", assignees: ["u4"], comments: 0, files: 0, progress: 0 },
  { id: "STR-127", col: "review", title: "Pricing page — “Teams” tier copy revision", desc: "Tighten value props; pull benchmarks from May survey.", tags: ["mkt"], priority: "med", due: "May 05", assignees: ["u5"], comments: 7, files: 3, progress: 90 },
  { id: "STR-133", col: "review", title: "Empty-state illustrations (5 variants)", desc: "Layered concept-art style. Match the brand mark's offset duotone.", tags: ["design"], priority: "med", due: "May 07", assignees: ["u1","u6"], comments: 3, files: 4, progress: 80 },
  { id: "STR-088", col: "done", title: "Drag-and-drop performance pass", desc: "Memoize columns; switch to transform-only animation. 60fps on 500-card boards.", tags: ["eng"], priority: "high", due: "Apr 28", assignees: ["u2","u4"], comments: 9, files: 0, progress: 100 },
  { id: "STR-102", col: "done", title: "Audit log MVP", desc: "Append-only event store, 90-day retention.", tags: ["eng","ops"], priority: "med", due: "Apr 30", assignees: ["u4"], comments: 5, files: 0, progress: 100 },
  { id: "STR-115", col: "done", title: "Email digest template", desc: "", tags: ["mkt","design"], priority: "low", due: "Apr 26", assignees: ["u5","u1"], comments: 2, files: 1, progress: 100 },
  { id: "STR-170", col: "backlog", title: "GraphQL schema for cross-board search", desc: "", tags: ["eng"], priority: "low", due: "Jun 02", assignees: ["u2"], comments: 0, files: 0, progress: 0 },
  { id: "STR-172", col: "backlog", title: "Concept: keyboard-first command palette", desc: "Linear-style ⌘K with fuzzy match across boards, tasks, members.", tags: ["design","eng"], priority: "med", due: "Jun 10", assignees: ["u1","u2"], comments: 1, files: 2, progress: 0 },
];

const COMMENTS_SEED = {
  "STR-142": [
    { id: "c1", user: "u3", at: "Yesterday · 16:42", text: "Pulled three story-beat thumbnails — leaning into the offset-block motif for the cursor demo. Shared in the files." },
    { id: "c2", user: "u2", at: "Today · 09:15", text: "Love the second beat. Can we land the drop on a frame where the card snaps to grid? Feels more rewarding." },
    { id: "c3", user: "u1", at: "Today · 10:02", text: "Good call. I'll cut the timing to ~220ms with a small overshoot — matches the ease curve in `tokens.motion.spring`." },
    { id: "c4", user: "u3", at: "Today · 10:30", text: "Approved. Pushing v2 to the shared canvas now." },
  ],
};

const NOTIFICATIONS_SEED = [
  { id: "n1", user: "u3", text: "**Aiko Tanaka** approved your draft on **Layered onboarding flow**", at: "10m ago", unread: true, taskId: "STR-142" },
  { id: "n2", user: "u2", text: "**Mateo Ruiz** mentioned you in **Realtime board sync**", at: "32m ago", unread: true, taskId: "STR-138" },
  { id: "n3", user: "u5", text: "**Priya Shah** moved **Pricing page — Teams tier** to *In review*", at: "1h ago", unread: true, taskId: "STR-127" },
  { id: "n4", user: "u4", text: "**Devon King** uploaded `audit-schema.sql` to **Audit log MVP**", at: "3h ago", unread: false, taskId: "STR-102" },
  { id: "n5", user: "u6", text: "**Noah Berg** completed **Email digest template**", at: "Yesterday", unread: false, taskId: "STR-115" },
];

const AUDIT_SEED = [
  { at: "2026-05-04 11:42:08", actor: "u1", evt: "task.update", target: "STR-142", details: "status: in_progress → in_review" },
  { at: "2026-05-04 11:14:51", actor: "u2", evt: "task.comment", target: "STR-138", details: "added comment (147 chars)" },
  { at: "2026-05-04 10:30:12", actor: "u3", evt: "file.upload", target: "STR-142", details: "onboard-storyboard-v2.fig (4.2 MB)" },
  { at: "2026-05-04 09:58:33", actor: "u4", evt: "role.grant", target: "u6", details: "user → editor" },
  { at: "2026-05-04 09:12:04", actor: "u5", evt: "task.create", target: "STR-172", details: "Concept: keyboard-first command palette" },
  { at: "2026-05-04 08:47:19", actor: "u2", evt: "auth.login", target: "session", details: "ip 10.0.4.18 · macOS · Safari" },
  { at: "2026-05-03 17:22:46", actor: "u1", evt: "task.move", target: "STR-088", details: "in_review → done" },
  { at: "2026-05-03 16:01:09", actor: "u4", evt: "settings.update", target: "workspace", details: "audit_retention: 60d → 90d" },
  { at: "2026-05-03 14:38:51", actor: "u6", evt: "task.delete", target: "STR-119", details: "Soft-deleted (recoverable 30d)" },
  { at: "2026-05-03 11:09:27", actor: "u5", evt: "task.assign", target: "STR-127", details: "+ Priya Shah" },
  { at: "2026-05-03 09:55:14", actor: "u3", evt: "auth.login", target: "session", details: "ip 10.0.4.91 · iOS · Safari" },
  { at: "2026-05-02 18:41:02", actor: "u4", evt: "webhook.fire", target: "slack#design", details: "task.move (STR-133)" },
];

window.STRATA_DATA = { USERS, ME, TAGS, TAGS_DARK, COLUMNS, TASK_SEED, COMMENTS_SEED, NOTIFICATIONS_SEED, AUDIT_SEED };
