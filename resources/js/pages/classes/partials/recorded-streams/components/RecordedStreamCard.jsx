import {
  BookOpen,
  Braces,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Edit2,
  ExternalLink,
  FileCode2,
  Flame,
  Github,
  GitBranch,
  LayoutGrid,
  Palette,
  Paintbrush,
  Play,
  Trash2,
  User,
  Video,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  courseBadgeStyles,
  formatDate,
  formatDuration,
  recordingCourse,
} from "../lib/recordingFormatters";

const courseVisuals = {
  "HTML Course": {
    thumbnail:
      "from-orange-500/35 via-orange-300/20 to-neutral-950 dark:from-orange-500/40 dark:via-orange-500/15 dark:to-neutral-950",
  },
  "CSS Course": {
    thumbnail:
      "from-blue-500/35 via-sky-300/20 to-neutral-950 dark:from-blue-500/40 dark:via-blue-500/15 dark:to-neutral-950",
  },
  "JavaScript Course": {
    thumbnail:
      "from-yellow-400/40 via-amber-300/20 to-neutral-950 dark:from-yellow-400/40 dark:via-yellow-400/15 dark:to-neutral-950",
  },
  "Bootstrap Course": {
    thumbnail:
      "from-purple-500/40 via-violet-300/20 to-neutral-950 dark:from-purple-500/40 dark:via-purple-500/15 dark:to-neutral-950",
  },
  "Sass Course": {
    thumbnail:
      "from-pink-500/35 via-rose-300/20 to-neutral-950 dark:from-pink-500/40 dark:via-pink-500/15 dark:to-neutral-950",
  },
  "Git Course": {
    thumbnail:
      "from-red-500/35 via-orange-300/20 to-neutral-950 dark:from-red-500/40 dark:via-orange-500/15 dark:to-neutral-950",
  },
  "GitHub Course": {
    thumbnail:
      "from-neutral-500/35 via-neutral-400/15 to-neutral-950 dark:from-neutral-400/25 dark:via-neutral-700/35 dark:to-neutral-950",
  },
  "Tailwind Course": {
    thumbnail:
      "from-cyan-400/35 via-sky-300/20 to-neutral-950 dark:from-cyan-400/40 dark:via-cyan-400/15 dark:to-neutral-950",
  },
  "Laravel Course": {
    thumbnail:
      "from-red-500/35 via-rose-300/20 to-neutral-950 dark:from-red-500/40 dark:via-red-500/15 dark:to-neutral-950",
  },
  "General Course": {
    thumbnail:
      "from-neutral-400/25 via-amber-200/15 to-neutral-950 dark:from-neutral-500/20 dark:via-neutral-700/20 dark:to-neutral-950",
  },
};

const courseIcons = {
  "HTML Course": FileCode2,
  "CSS Course": Paintbrush,
  "JavaScript Course": Braces,
  "Bootstrap Course": LayoutGrid,
  "Sass Course": Palette,
  "Git Course": GitBranch,
  "GitHub Course": Github,
  "Tailwind Course": Wind,
  "Laravel Course": Flame,
  "General Course": BookOpen,
};

function CourseBadge({ course }) {
  const className = courseBadgeStyles[course] ?? courseBadgeStyles["General Course"];
  const Icon = courseIcons[course] ?? Code2;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {course}
    </span>
  );
}

function RecordingThumbnail({ course, duration, recording, title }) {
  const visual = courseVisuals[course] ?? courseVisuals["General Course"];

  return (
    <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-neutral-950">
      {recording.thumbnail_url ? (
        <img
          src={recording.thumbnail_url}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.32),transparent_24%),linear-gradient(135deg,var(--tw-gradient-stops))] ${visual.thumbnail}`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_34%,rgba(255,208,38,0.12)_65%,transparent)]" />
          <div className="absolute right-5 bottom-5 left-5">
            <p className="line-clamp-2 text-lg font-black tracking-tight text-white drop-shadow md:text-xl">
              {title}
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-2xl backdrop-blur transition group-hover:scale-105 group-hover:bg-[#FFD026] group-hover:text-[#102033]">
          <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
        </span>
      </div>

      <span className="absolute right-3 bottom-3 rounded-md bg-black/75 px-2 py-1 font-mono text-xs font-bold text-white shadow-lg backdrop-blur">
        {duration}
      </span>
    </div>
  );
}

export function RecordedStreamCard({
  canManageRecordings,
  deletingRecordingId,
  onDelete,
  onEdit,
  recording,
}) {
  const title = recording.title || "Untitled recording";
  const course = recordingCourse(recording);
  const date = formatDate(recording.recorded_at);
  const duration = formatDuration(recording.duration_seconds);
  const coach = recording.created_by || "Unknown coach";
  const isSourceReady = Boolean(recording.has_streamable_source);

  return (
    <article className="group flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#E8E1D1] bg-white shadow-[0_12px_30px_rgba(16,32,51,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#FFD026]/70 hover:shadow-[0_22px_44px_rgba(255,208,38,0.14)] dark:border-neutral-800 dark:bg-neutral-950/70 dark:shadow-black/20 dark:hover:border-[#FFD026]/45">
      <RecordingThumbnail
        course={course}
        duration={duration}
        recording={recording}
        title={title}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-3">
          <CourseBadge course={course} />

          <div className="space-y-2">
            <h3 className="line-clamp-2 text-base font-black leading-6 text-neutral-950 dark:text-white">
              {title}
            </h3>
            <p className="line-clamp-2 min-h-10 text-sm leading-5 text-neutral-600 dark:text-neutral-400">
              {recording.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              {date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              {duration}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              {coach}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 ${
                isSourceReady
                  ? "text-green-700 dark:text-green-300"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {isSourceReady ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}
              {isSourceReady ? "Source ready" : "Source not available"}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {recording.stream_url ? (
            <a
              href={recording.stream_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#FFD026] px-4 text-sm font-black text-[#102033] shadow-sm transition hover:bg-[#FFC400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD026] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          ) : (
            <span className="inline-flex h-10 items-center rounded-xl border border-[#E8E1D1] px-4 text-sm font-semibold text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
              Not available
            </span>
          )}

          {canManageRecordings && (
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(recording)}
                className="h-10 rounded-xl border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDelete(recording)}
                disabled={deletingRecordingId === recording.id}
                className="h-10 rounded-xl border-red-200 bg-white px-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:bg-neutral-950 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingRecordingId === recording.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
