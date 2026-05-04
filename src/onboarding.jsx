// Onboarding hint tooltip

const OnboardingTip = ({ step, total, anchor, title, body, onNext, onSkip, placement = "bottom" }) => {
  const [pos, setPos] = React.useState(null);
  React.useLayoutEffect(() => {
    if (!anchor) return;
    const el = document.querySelector(anchor);
    if (!el) return;
    const r = el.getBoundingClientRect();
    let top, left;
    if (placement === "bottom") { top = r.bottom + 12; left = r.left + r.width / 2 - 120; }
    else if (placement === "right") { top = r.top + r.height / 2 - 30; left = r.right + 12; }
    else if (placement === "top") { top = r.top - 110; left = r.left + r.width / 2 - 120; }
    else { top = r.top; left = r.left; }
    setPos({ top: Math.max(8, top), left: Math.max(8, Math.min(left, window.innerWidth - 260)) });
  }, [anchor, placement]);
  if (!pos) return null;
  return (
    <div className="tip" style={{ top: pos.top, left: pos.left }}>
      <b>{title}</b>
      <div>{body}</div>
      <div className="tip-foot">
        <span>{step} of {total}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onSkip} style={{ background: "transparent", color: "inherit", opacity: 0.7 }}>Skip</button>
          <button onClick={onNext}>{step === total ? "Done" : "Next"}</button>
        </div>
      </div>
    </div>
  );
};

window.OnboardingTip = OnboardingTip;
