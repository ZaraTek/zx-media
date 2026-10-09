import { useLayoutEffect, useRef, useState } from "react";
import type { Season } from "../types";

interface SeasonTabsProps {
  title: string;
  seasons: Season[];
  activeSeason: number;
  onSelect: (seasonNumber: number) => void;
}

const BUTTON_GAP = 8; // gap-2 between buttons inside a pill
const PILL_CHROME = 10; // p-1 padding (4px each side) + 1px border each side
const HEADING_GAP = 16; // gap-4 between heading and the pill

const buttonClasses =
  "flex flex-col items-center rounded-full px-4 py-1.5 leading-tight transition";
const pillClasses =
  "flex gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1";

interface Layout {
  stacked: boolean;
  rows: Season[][];
}

export default function SeasonTabs({
  title,
  seasons,
  activeSeason,
  onSelect,
}: SeasonTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({
    stacked: false,
    rows: [seasons],
  });

  useLayoutEffect(() => {
    const row = rowRef.current;
    const heading = headingRef.current;
    const measure = measureRef.current;
    if (!row || !heading || !measure) return;

    const compute = () => {
      const total = row.clientWidth;
      const headingSpace = heading.offsetWidth + HEADING_GAP;
      const widths = Array.from(measure.children).map(
        (el) => (el as HTMLElement).offsetWidth
      );
      const allButtonsWidth =
        PILL_CHROME +
        widths.reduce((sum, w) => sum + w, 0) +
        BUTTON_GAP * Math.max(widths.length - 1, 0);

      // Everything fits on one line next to the heading: single pill.
      if (allButtonsWidth <= total - headingSpace) {
        setLayout((prev) =>
          !prev.stacked && prev.rows.length === 1
            ? prev
            : { stacked: false, rows: [seasons] }
        );
        return;
      }

      // Otherwise stack the heading above pills that each fill a full row.
      const chunks: Season[][] = [];
      let index = 0;
      while (index < seasons.length) {
        let used = PILL_CHROME;
        let count = 0;
        while (index + count < seasons.length) {
          const w = widths[index + count] + (count > 0 ? BUTTON_GAP : 0);
          if (count > 0 && used + w > total) break;
          used += w;
          count++;
        }
        chunks.push(seasons.slice(index, index + count));
        index += count;
      }

      setLayout((prev) =>
        prev.stacked &&
        prev.rows.map((c) => c.length).join() ===
          chunks.map((c) => c.length).join()
          ? prev
          : { stacked: true, rows: chunks }
      );
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(row);
    return () => observer.disconnect();
  }, [seasons]);

  return (
    <div className="relative">
      <div
        ref={rowRef}
        className={
          layout.stacked
            ? "flex flex-col gap-3"
            : "flex items-center justify-between gap-4"
        }
      >
        <h2 ref={headingRef} className="text-xl font-bold tracking-tight">
          {title}
        </h2>
        {seasons.length > 1 &&
          (layout.stacked ? (
            <div className="flex flex-col items-start gap-2">
              {layout.rows.map((chunk) => (
                <div key={chunk[0].number} className={pillClasses}>
                  {chunk.map((s) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => onSelect(s.number)}
                      className={`${buttonClasses} ${
                        activeSeason === s.number
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-medium opacity-60">
                        Season
                      </span>
                      <span className="text-sm font-semibold">{s.number}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className={pillClasses}>
              {seasons.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => onSelect(s.number)}
                  className={`${buttonClasses} ${
                    activeSeason === s.number
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-60">
                    Season
                  </span>
                  <span className="text-sm font-semibold">{s.number}</span>
                </button>
              ))}
            </div>
          ))}
      </div>

      {seasons.length > 1 && (
        <div
          ref={measureRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 flex h-0 gap-2 overflow-hidden opacity-0"
        >
          {seasons.map((s) => (
            <button
              key={s.number}
              type="button"
              tabIndex={-1}
              className={buttonClasses}
            >
              <span className="text-[11px] font-medium opacity-60">Season</span>
              <span className="text-sm font-semibold">{s.number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
