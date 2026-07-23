import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { durationInputValue } from "../lib/recordingFormatters";

export function RecordingUploadModal({
  error,
  fieldErrors,
  fileInputRef,
  form,
  isUploading,
  onFileChange,
  onOpenChange,
  onSubmit,
  onUpdateForm,
  open,
  trigger,
}) {
  const readVideoDuration = (file) => {
    if (!file || typeof document === "undefined") {
      return;
    }

    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      cleanup();

      const seconds = Math.floor(Number(video.duration));
      const duration = durationInputValue(seconds);

      if (duration) {
        onUpdateForm("duration", duration);
      }
    };
    video.onerror = cleanup;
    video.src = objectUrl;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    onFileChange(event);
    readVideoDuration(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-[#E8D49A] bg-white dark:border-[#4A3B12] dark:bg-neutral-950 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload recording</DialogTitle>
          <DialogDescription>
            Add an MP4 classroom recording for this class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="recording-title">Title</Label>
            <Input
              id="recording-title"
              value={form.title}
              onChange={(event) => onUpdateForm("title", event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              disabled={isUploading}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recording-description">Description</Label>
            <textarea
              id="recording-description"
              value={form.description}
              onChange={(event) =>
                onUpdateForm("description", event.target.value)
              }
              rows={4}
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              aria-invalid={Boolean(fieldErrors.description)}
              disabled={isUploading}
            />
            {fieldErrors.description && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="recording-duration">Duration</Label>
              <Input
                id="recording-duration"
                value={form.duration}
                onChange={(event) => onUpdateForm("duration", event.target.value)}
                placeholder="45:30"
                aria-invalid={Boolean(fieldErrors.duration)}
                disabled={isUploading}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Format: MM:SS or HH:MM:SS
              </p>
              {fieldErrors.duration && (
                <p className="text-xs font-medium text-red-600 dark:text-red-300">
                  {fieldErrors.duration}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recording-recorded-at">Recorded at</Label>
              <Input
                id="recording-recorded-at"
                type="datetime-local"
                value={form.recorded_at}
                onChange={(event) =>
                  onUpdateForm("recorded_at", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.recorded_at)}
                disabled={isUploading}
              />
              {fieldErrors.recorded_at && (
                <p className="text-xs font-medium text-red-600 dark:text-red-300">
                  {fieldErrors.recorded_at}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(value) => onUpdateForm("visibility", value)}
                disabled={isUploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class_students">Class students</SelectItem>
                  <SelectItem value="staff_only">Staff only</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.visibility && (
                <p className="text-xs font-medium text-red-600 dark:text-red-300">
                  {fieldErrors.visibility}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recording-video">MP4 video</Label>
            <Input
              ref={fileInputRef}
              id="recording-video"
              type="file"
              accept="video/mp4,.mp4"
              onChange={handleFileChange}
              aria-invalid={Boolean(fieldErrors.video)}
              disabled={isUploading}
              required
            />
            {fieldErrors.video && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                {fieldErrors.video}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="bg-[#FFD026] text-[#102033] hover:bg-[#FFC400]"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Recording"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}