/**
 * FLOODLIGHT StatStrip — horizontal row of severity stat tiles.
 *
 * Matches spec `.stat-strip / .stat` (lines 255–258):
 * - Each stat: bg-surface, border-line, rounded-lg (10px), padded 12/16
 * - Number: big display font weight-700, colored by severity
 * - Label: 12px, text-ink-3
 *
 * Optional interactivity (opt-in, non-breaking):
 * - `onSelect` — renders the tile as a <button> for click-to-filter.
 * - `state` — "default" (normal), "active" (selected, ring emphasis),
 *             "dimmed" (faded grey when another tile is selected).
 */

import { type DesignSeverity } from "@/lib/audit/severity";

// Tailwind class for the large display number (foreground color only)
const NUMBER_COLOR: Record<DesignSeverity, string> = {
  clear: "text-clear",
  low: "text-low",
  med: "text-med",
  high: "text-high",
  crit: "text-crit",
};

interface StatProps {
  count: number;
  label: string;
  severity: DesignSeverity;
  /** When provided the tile renders as a <button> and calls this on click. */
  onSelect?: () => void;
  /**
   * "default"  — normal appearance (no filter active).
   * "active"   — this severity is the active filter; ring highlight.
   * "dimmed"   — another severity is active; fade to grey.
   */
  state?: "default" | "active" | "dimmed";
}

export function Stat({ count, label, severity, onSelect, state = "default" }: StatProps) {
  const isDimmed = state === "dimmed";
  const isActive = state === "active";

  const numberClass = isDimmed
    ? "text-ink-3"
    : NUMBER_COLOR[severity];

  const wrapperClass = [
    "flex min-w-[110px] flex-1 flex-col gap-[5px] rounded-lg border bg-surface px-4 py-3 transition-opacity",
    isActive ? "border-primary ring-1 ring-primary" : "border-line",
    isDimmed ? "opacity-50" : "opacity-100",
    onSelect ? "cursor-pointer text-left hover:opacity-80" : "",
  ].join(" ");

  const inner = (
    <>
      <span className={`font-sans text-[26px] font-bold leading-none ${numberClass}`}>
        {count.toLocaleString()}
      </span>
      <span className="text-[12px] text-ink-3">{label}</span>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={wrapperClass}>
        {inner}
      </button>
    );
  }
  return <div className={wrapperClass}>{inner}</div>;
}

interface StatStripProps {
  stats: StatProps[];
  className?: string;
}

export function StatStrip({ stats, className = "" }: StatStripProps) {
  return (
    <div className={`flex flex-wrap gap-[10px] ${className}`}>
      {stats.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </div>
  );
}

// Re-export the NUMBER_COLOR map in case callers want it
export { NUMBER_COLOR };
