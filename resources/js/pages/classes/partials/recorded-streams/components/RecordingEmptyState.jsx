import { Video } from "lucide-react";

export function RecordingEmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-[#E8D49A] bg-white/70 px-6 py-10 text-center dark:border-[#4A3B12] dark:bg-neutral-950/50">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE8A3] text-[#1F2937] dark:bg-[#2A240D] dark:text-[#FACC15]">
        <Video className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
        No recordings uploaded yet
      </h3>
      <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        Uploaded sessions will appear here for students in the recordings
        library.
      </p>
    </div>
  );
}
