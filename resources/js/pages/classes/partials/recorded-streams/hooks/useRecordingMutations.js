import { router } from "@inertiajs/react";
import { useState } from "react";
import {
  durationMessage,
  durationPattern,
  validationErrorsFrom,
} from "../lib/recordingFormatters";

const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

const xsrfToken = () => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("XSRF-TOKEN="));

  return cookie ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length)) : null;
};

const reloadRecordings = () => {
  router.reload({
    only: ["data"],
    preserveScroll: true,
    preserveState: true,
  });
};

export function useRecordingMutations({ canManageRecordings, canUpload, classId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadFieldErrors, setUploadFieldErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [deleteError, setDeleteError] = useState(null);
  const [deletingRecordingId, setDeletingRecordingId] = useState(null);
  const [success, setSuccess] = useState(null);

  const clearUploadFieldError = (key) => {
    setUploadFieldErrors((current) => ({
      ...current,
      [key]: null,
    }));
  };

  const clearEditFieldError = (key) => {
    setEditFieldErrors((current) => ({
      ...current,
      [key]: null,
    }));
  };

  const resetUploadFeedback = () => {
    setUploadError(null);
    setUploadFieldErrors({});
  };

  const resetEditFeedback = () => {
    setEditError(null);
    setEditFieldErrors({});
  };

  const uploadRecording = async ({ form, videoFile }) => {
    if (!canUpload || !classId || isUploading) {
      return false;
    }

    const title = form.title.trim();
    const description = form.description.trim();
    const duration = form.duration.trim();

    if (!title || !videoFile) {
      setUploadError("Title and MP4 video are required.");
      setUploadFieldErrors({
        title: !title ? "Title is required." : null,
        video: !videoFile ? "MP4 video is required." : null,
      });

      return false;
    }

    if (duration && !durationPattern.test(duration)) {
      setUploadError(durationMessage);
      setUploadFieldErrors({
        duration: durationMessage,
      });

      return false;
    }

    if (videoFile.type !== "video/mp4") {
      setUploadError("Only MP4 video files can be uploaded.");
      setUploadFieldErrors({
        video: "Only MP4 video files can be uploaded.",
      });

      return false;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("visibility", form.visibility);
    formData.append("video", videoFile);

    if (description) {
      formData.append("description", description);
    }

    if (form.recorded_at) {
      formData.append("recorded_at", form.recorded_at);
    }

    if (duration) {
      formData.append("duration", duration);
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadFieldErrors({});
    setSuccess(null);

    try {
      const response = await fetch(`/classes/${classId}/recordings/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken() ?? "",
          "X-XSRF-TOKEN": xsrfToken() ?? "",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setUploadFieldErrors(validationErrorsFrom(data));

        throw new Error(
          data.message || "Recording upload failed. Please check the form.",
        );
      }

      setSuccess("Recording uploaded successfully.");
      reloadRecordings();

      return true;
    } catch (error) {
      setUploadError(error.message);

      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const updateRecording = async ({ editForm, recording }) => {
    if (!canManageRecordings || !recording || isUpdating) {
      return false;
    }

    const title = editForm.title.trim();
    const description = editForm.description.trim();
    const duration = editForm.duration.trim();

    if (!title) {
      setEditError("Title is required.");
      setEditFieldErrors({
        title: "Title is required.",
      });

      return false;
    }

    if (duration && !durationPattern.test(duration)) {
      setEditError(durationMessage);
      setEditFieldErrors({
        duration: durationMessage,
      });

      return false;
    }

    setIsUpdating(true);
    setEditError(null);
    setEditFieldErrors({});
    setSuccess(null);

    try {
      const response = await fetch(`/recordings/${recording.id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken() ?? "",
          "X-XSRF-TOKEN": xsrfToken() ?? "",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          title,
          description: description || null,
          duration: duration || null,
          recorded_at: editForm.recorded_at || null,
          visibility: editForm.visibility,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setEditFieldErrors(validationErrorsFrom(data));

        throw new Error(
          data.message || "Recording update failed. Please check the form.",
        );
      }

      setSuccess("Recording updated successfully.");
      reloadRecordings();

      return true;
    } catch (error) {
      setEditError(error.message);

      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRecording = async (recording) => {
    if (!canManageRecordings || deletingRecordingId || !recording) {
      return false;
    }

    setDeletingRecordingId(recording.id);
    setDeleteError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/recordings/${recording.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken() ?? "",
          "X-XSRF-TOKEN": xsrfToken() ?? "",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Recording delete failed.");
      }

      setSuccess("Recording deleted successfully.");
      reloadRecordings();

      return true;
    } catch (error) {
      setDeleteError(error.message);

      return false;
    } finally {
      setDeletingRecordingId(null);
    }
  };

  return {
    clearEditFieldError,
    clearUploadFieldError,
    deleteError,
    deleteRecording,
    deletingRecordingId,
    editError,
    editFieldErrors,
    isUpdating,
    isUploading,
    resetEditFeedback,
    resetUploadFeedback,
    success,
    updateRecording,
    uploadError,
    uploadFieldErrors,
    uploadRecording,
  };
}
