import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ExitFullscreenIcon,
  Forward10Icon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  Rewind10Icon,
  VolumeIcon,
} from "./icons";

interface VideoPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  poster?: string;
  onEnded?: () => void;
}

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

function isEmbedSource(src: string): boolean {
  return /\/embed\/(movie|tv)\//.test(src);
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function VideoPlayer({
  src,
  title,
  subtitle,
  poster,
  onEnded,
}: VideoPlayerProps) {
  const embedMode = isEmbedSource(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [waiting, setWaiting] = useState(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(
      Math.max(0, v.currentTime + delta),
      v.duration || 0
    );
  }, []);

  const seekTo = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setCurrent(value);
  }, []);

  const changeVolume = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = value;
    v.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const setPlaybackSpeed = useCallback((rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setSpeed(rate);
    setSpeedOpen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, (videoRef.current?.volume ?? 1) + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, (videoRef.current?.volume ?? 0) - 0.1));
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        default:
          return;
      }
      revealControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePlay,
    seekBy,
    changeVolume,
    toggleFullscreen,
    toggleMute,
    revealControls,
  ]);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  if (embedMode) {
    return (
      <div
        ref={containerRef}
        className={`group relative flex w-full items-center justify-center overflow-hidden bg-black ${
          fullscreen ? "h-screen" : "aspect-video max-h-[80vh] rounded-2xl"
        }`}
      >
        <iframe
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          className="h-full w-full border-0"
        />

        <div className="pointer-events-none absolute left-0 right-0 top-0 bg-gradient-to-b from-black/85 to-transparent p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white drop-shadow sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-300 drop-shadow">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/55 p-2 text-white backdrop-blur transition hover:text-[var(--color-accent-bright)]"
        >
          {fullscreen ? (
            <ExitFullscreenIcon className="h-5 w-5" />
          ) : (
            <FullscreenIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className={`group relative flex w-full items-center justify-center overflow-hidden bg-black ${
        fullscreen ? "h-screen" : "aspect-video max-h-[80vh] rounded-2xl"
      } ${controlsVisible ? "cursor-default" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setVolume(e.currentTarget.volume);
        }}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length > 0) {
            setBuffered(v.buffered.end(v.buffered.length - 1));
          }
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

      {waiting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[var(--color-accent-bright)]" />
        </div>
      )}

      {!playing && !waiting && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/90 text-white shadow-2xl shadow-black/50 transition hover:scale-105 hover:bg-[var(--color-accent-bright)]">
            <PlayIcon className="ml-1 h-9 w-9" />
          </span>
        </button>
      )}

      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto bg-gradient-to-b from-black/70 to-transparent p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white drop-shadow sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-300 drop-shadow">{subtitle}</p>
          )}
        </div>

        <div className="pointer-events-auto flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 sm:px-6 sm:pb-5">
          <div className="relative flex items-center">
            <div className="absolute h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="absolute h-full rounded-full bg-white/30"
                style={{ width: `${bufferedPct}%` }}
              />
              <div
                className="absolute h-full rounded-full bg-[var(--color-accent-bright)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Seek"
              className="relative z-10 h-1.5 w-full"
            />
          </div>

          <div className="flex items-center gap-3 text-white sm:gap-4">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="transition hover:text-[var(--color-accent-bright)]"
            >
              {playing ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              aria-label="Rewind 10 seconds"
              className="transition hover:text-[var(--color-accent-bright)]"
            >
              <Rewind10Icon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => seekBy(10)}
              aria-label="Forward 10 seconds"
              className="transition hover:text-[var(--color-accent-bright)]"
            >
              <Forward10Icon className="h-6 w-6" />
            </button>

            <div className="group/vol flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="transition hover:text-[var(--color-accent-bright)]"
              >
                {muted || volume === 0 ? (
                  <MuteIcon className="h-6 w-6" />
                ) : (
                  <VolumeIcon className="h-6 w-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="Volume"
                className="h-1.5 w-0 opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100 sm:w-20 sm:opacity-100"
              />
            </div>

            <span className="text-sm font-medium tabular-nums text-slate-200">
              {formatTime(current)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSpeedOpen((o) => !o)}
                  aria-label="Playback speed"
                  className="rounded-md px-2 py-1 text-sm font-semibold transition hover:bg-white/10 hover:text-[var(--color-accent-bright)]"
                >
                  {speed}×
                </button>
                {speedOpen && (
                  <div className="absolute bottom-full right-0 mb-2 flex w-24 flex-col overflow-hidden rounded-lg border border-white/10 bg-[var(--color-surface-2)] py-1 shadow-xl">
                    {SPEEDS.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPlaybackSpeed(rate)}
                        className={`px-3 py-1.5 text-left text-sm transition hover:bg-white/10 ${
                          rate === speed
                            ? "font-bold text-[var(--color-accent-bright)]"
                            : "text-slate-200"
                        }`}
                      >
                        {rate === 1 ? "Normal" : `${rate}×`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="transition hover:text-[var(--color-accent-bright)]"
              >
                {fullscreen ? (
                  <ExitFullscreenIcon className="h-6 w-6" />
                ) : (
                  <FullscreenIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
