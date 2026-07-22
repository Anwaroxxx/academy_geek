export const initialRecordingForm = {
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
