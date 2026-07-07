import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M6 4.5v15l13-7.5-13-7.5z" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const VolumeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const MuteIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
);

export const FullscreenIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

export const ExitFullscreenIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M16 21v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

export const Rewind10Icon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M11 4 4 9l7 5V4z" />
    <path d="M11 9h5a5 5 0 1 1 0 10h-2" />
  </svg>
);

export const Forward10Icon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13 4l7 5-7 5V4z" />
    <path d="M13 9H8a5 5 0 1 0 0 10h2" />
  </svg>
);

export const BackIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const StarIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 2.5 15 9l7 .6-5.3 4.6L18.3 21 12 17.3 5.7 21l1.6-6.8L2 9.6 9 9z" />
  </svg>
);

export const LibraryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="14" height="16" rx="2" />
    <path d="M21 6v14M17 4l4 2" />
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);
