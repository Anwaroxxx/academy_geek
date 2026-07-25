export const courseOptions = [
  "HTML Course",
  "CSS Course",
  "JavaScript Course",
  "Bootstrap Course",
  "Sass Course",
  "Git Course",
  "GitHub Course",
  "Tailwind Course",
  "Laravel Course",
];

export const courseBadgeStyles = {
  "HTML Course": "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200",
  "CSS Course": "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200",
  "JavaScript Course": "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-400/30 dark:bg-yellow-400/15 dark:text-yellow-200",
  "Bootstrap Course": "border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-200",
  "Sass Course": "border-pink-200 bg-pink-100 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-200",
  "Git Course": "border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
  "GitHub Course": "border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-neutral-500/40 dark:bg-neutral-700/40 dark:text-neutral-100",
  "Tailwind Course": "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/15 dark:text-cyan-200",
  "Laravel Course": "border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
  "General Course": "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-600/40 dark:bg-neutral-800/60 dark:text-neutral-200",
};

export const initialRecordingForm = {
  course: "",
  title: "",
  description: "",
  duration: "",
  recorded_at: "",
  visibility: "class_students",
};

export const durationPattern = /^(\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$/;
export const durationMessage = "Duration must be in MM:SS or HH:MM:SS format.";

export function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function toDateTimeInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Duration pending";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(" ");
}

export function durationInputValue(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

export function validationErrorsFrom(data) {
  if (!data.errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data.errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(" ") : String(messages),
    ]),
  );
}

export function recordingCourse(recording) {
  const course = recording?.metadata?.course;

  return typeof course === "string" && course.trim() ? course.trim() : "General Course";
}
