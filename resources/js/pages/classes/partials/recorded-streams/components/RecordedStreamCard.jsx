import {
  Calendar,
  Clock,
  Edit2,
  ExternalLink,
  HardDrive,
  Trash2,
  User,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "../lib/recordingFormatters";

export function RecordedStreamCard({
  canManageRecordings,
  deletingRecordingId,
  onDelete,
  onEdit,
  recording,
}) {
  return (
    <article className="flex min-h-[220px] flex-col rounded-2xl border border-[#E8E1D1] bg-white/80 p-4 shadow-[0_10px_25px_rgba(0,0,0,.035)] transition hover:-translate-y-0.5 hover:border-[#E8D49A] hover:shadow-[0_18px_35px_rgba(0,0,0,.06)] dark:border-neutral-800 dark:bg-neutral-950/50 dark:hover:border-[#4A3B12]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE8A3] text-[#1F2937] dark:bg-[#2A240D] dark:text-[#FACC15]">
          <Video className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-neutral-900 dark:text-white">
            {recording.title || "Untitled recording"}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            {recording.description || "No description provided"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          {formatDate(recording.recorded_at)}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          {formatDuration(recording.duration_seconds)}
        </span>
        <span className="inline-flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-neutral-400" />
          {recording.created_by || "Unknown"}
        </span>
        <span className="inline-flex items-center gap-2">
          <HardDrive className="h-3.5 w-3.5 text-neutral-400" />
          {recording.has_streamable_source
            ? "Source ready"
            : "Source not available"}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {recording.stream_url ? (
          <a
            href={recording.stream_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FFD026] px-3 text-xs font-bold text-[#102033] transition hover:bg-[#FFC400]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        ) : (
          <span className="inline-flex h-9 items-center rounded-lg border border-[#E8E1D1] px-3 text-xs font-semibold text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
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
              className="h-9 rounded-lg px-3 text-xs"
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
              className="h-9 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deletingRecordingId === recording.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
