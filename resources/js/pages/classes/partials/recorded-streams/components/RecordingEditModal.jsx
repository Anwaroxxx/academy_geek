import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

export function RecordingEditModal({
  error,
  fieldErrors,
  form,
  isUpdating,
  onClose,
  onSubmit,
  onUpdateForm,
  open,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-[#E8D49A] bg-white dark:border-[#4A3B12] dark:bg-neutral-950 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit recording</DialogTitle>
          <DialogDescription>
            Update the recording details shown to this class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-recording-title">Title</Label>
            <Input
              id="edit-recording-title"
              value={form.title}
              onChange={(event) => onUpdateForm("title", event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              disabled={isUpdating}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-recording-description">Description</Label>
            <textarea
              id="edit-recording-description"
              value={form.description}
              onChange={(event) =>
                onUpdateForm("description", event.target.value)
              }
              rows={4}
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              aria-invalid={Boolean(fieldErrors.description)}
              disabled={isUpdating}
            />
            {fieldErrors.description && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-recording-duration">Duration</Label>
              <Input
                id="edit-recording-duration"
                value={form.duration}
                onChange={(event) => onUpdateForm("duration", event.target.value)}
                placeholder="45:30"
                aria-invalid={Boolean(fieldErrors.duration)}
                disabled={isUpdating}
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
              <Label htmlFor="edit-recording-recorded-at">Recorded at</Label>
              <Input
                id="edit-recording-recorded-at"
                type="datetime-local"
                value={form.recorded_at}
                onChange={(event) =>
                  onUpdateForm("recorded_at", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.recorded_at)}
                disabled={isUpdating}
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
                disabled={isUpdating}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-[#FFD026] text-[#102033] hover:bg-[#FFC400]"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
