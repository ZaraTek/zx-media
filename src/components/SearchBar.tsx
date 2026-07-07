import { SearchIcon } from "./icons";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search shows, genres...",
  autoFocus,
}: SearchBarProps) {
  return (
    <div className="group relative w-full">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[var(--color-accent-bright)]" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 py-3.5 pl-12 pr-11 text-base text-slate-100 placeholder:text-slate-500 shadow-lg shadow-black/20 outline-none backdrop-blur transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}
