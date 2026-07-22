import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordingUploadModal } from "./RecordingUploadModal";

export function RecordedStreamsHeader({
  canUpload,
  isUploadOpen,
  onOpenChange,
  uploadModalProps,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#E8E1D1] px-6 py-5 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Recorded Streams
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Upload and manage recordings for this classroom.
        </p>
      </div>

      {canUpload && (
        <RecordingUploadModal
          open={isUploadOpen}
          onOpenChange={onOpenChange}
          trigger={
            <Button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-[#FFD026] to-[#FFC400] text-sm font-bold text-[#102033] shadow-md shadow-yellow-500/20 hover:from-[#FFD84A] hover:to-[#FFD026] md:w-auto"
            >
              <Upload className="h-4 w-4" />
              Upload Recording
            </Button>
          }
          {...uploadModalProps}
        />
      )}
    </div>
  );
}
