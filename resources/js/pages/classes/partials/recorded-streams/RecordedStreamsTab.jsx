import { useEffect, useMemo, useRef, useState } from "react";
import DeleteModal from "@/components/DeleteModal";
import { RecordingEditModal } from "./components/RecordingEditModal";
import { RecordingEmptyState } from "./components/RecordingEmptyState";
import { RecordedStreamsHeader } from "./components/RecordedStreamsHeader";
import { RecordedStreamsList } from "./components/RecordedStreamsList";
import { RecordedStreamsPagination } from "./components/RecordedStreamsPagination";
import {
  durationInputValue,
  initialRecordingForm,
  toDateTimeInput,
} from "./lib/recordingFormatters";
import { useRecordingMutations } from "./hooks/useRecordingMutations";

export default function RecordedStreamsTab({
  canUpload = false,
  classId,
  recordings = [],
}) {
  const recordingItems = Array.isArray(recordings)
    ? recordings
    : Array.isArray(recordings?.data)
      ? recordings.data
      : [];
  const canManageRecordings = canUpload;
  const fileInputRef = useRef(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState(initialRecordingForm);
  const [videoFile, setVideoFile] = useState(null);
  const [editingRecording, setEditingRecording] = useState(null);
  const [editForm, setEditForm] = useState(initialRecordingForm);
  const [deletingRecording, setDeletingRecording] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(recordingItems.length / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * perPage;
  const paginatedRecordings = useMemo(
    () => recordingItems.slice(pageStartIndex, pageStartIndex + perPage),
    [pageStartIndex, recordingItems],
  );
  const pageFrom = recordingItems.length === 0 ? 0 : pageStartIndex + 1;
  const pageTo = Math.min(pageStartIndex + paginatedRecordings.length, recordingItems.length);

  const mutations = useRecordingMutations({
    canManageRecordings,
    canUpload,
    classId,
  });

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const resetUploadForm = () => {
    setUploadForm(initialRecordingForm);
    setVideoFile(null);
    mutations.resetUploadFeedback();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateUploadForm = (key, value) => {
    setUploadForm((current) => ({
      ...current,
      [key]: value,
    }));
    mutations.clearUploadFieldError(key);
  };

  const handleUploadOpenChange = (open) => {
    setIsUploadOpen(open);

    if (!open && !mutations.isUploading) {
      resetUploadForm();
    }
  };

  const submitUpload = async (event) => {
    event.preventDefault();

    const uploaded = await mutations.uploadRecording({
      form: uploadForm,
      videoFile,
    });

    if (uploaded) {
      setIsUploadOpen(false);
      resetUploadForm();
    }
  };

  const updateEditForm = (key, value) => {
    setEditForm((current) => ({
      ...current,
      [key]: value,
    }));
    mutations.clearEditFieldError(key);
  };

  const openEditDialog = (recording) => {
    setEditingRecording(recording);
    setEditForm({
      course: recording.metadata?.course || "",
      title: recording.title || "",
      description: recording.description || "",
      duration: durationInputValue(recording.duration_seconds),
      recorded_at: toDateTimeInput(recording.recorded_at),
      visibility: recording.visibility || "class_students",
    });
    mutations.resetEditFeedback();
  };

  const closeEditDialog = () => {
    if (!mutations.isUpdating) {
      setEditingRecording(null);
      setEditForm(initialRecordingForm);
      mutations.resetEditFeedback();
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();

    const updated = await mutations.updateRecording({
      editForm,
      recording: editingRecording,
    });

    if (updated) {
      setEditingRecording(null);
      setEditForm(initialRecordingForm);
      mutations.resetEditFeedback();
    }
  };

  const confirmDelete = async () => {
    const deleted = await mutations.deleteRecording(deletingRecording);

    if (deleted) {
      setDeletingRecording(null);
      return;
    }

    throw new Error("Recording delete failed.");
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#ECE6D8] bg-gradient-to-r from-[#FFF8E5] via-[#FAF8F3] to-[#F4F4F2] shadow-[0_15px_45px_rgba(0,0,0,.05)] dark:border-neutral-700 dark:bg-none dark:bg-gradient-to-r dark:from-[#1B1B1B] dark:via-[#181818] dark:to-[#121212]">
      <RecordedStreamsHeader
        canUpload={canUpload}
        isUploadOpen={isUploadOpen}
        onOpenChange={handleUploadOpenChange}
        uploadModalProps={{
          error: mutations.uploadError,
          fieldErrors: mutations.uploadFieldErrors,
          fileInputRef,
          form: uploadForm,
          isUploading: mutations.isUploading,
          onFileChange: (event) => {
            setVideoFile(event.target.files?.[0] ?? null);
            mutations.clearUploadFieldError("video");
          },
          onSubmit: submitUpload,
          onUpdateForm: updateUploadForm,
        }}
      />

      {mutations.success && (
        <div className="border-b border-[#E8E1D1] px-6 py-3 text-sm font-medium text-green-700 dark:border-neutral-800 dark:text-green-300">
          {mutations.success}
        </div>
      )}

      {mutations.deleteError && (
        <div className="border-b border-[#E8E1D1] px-6 py-3 text-sm font-medium text-red-700 dark:border-neutral-800 dark:text-red-300">
          {mutations.deleteError}
        </div>
      )}

      <RecordingEditModal
        error={mutations.editError}
        fieldErrors={mutations.editFieldErrors}
        form={editForm}
        isUpdating={mutations.isUpdating}
        onClose={closeEditDialog}
        onSubmit={submitEdit}
        onUpdateForm={updateEditForm}
        open={Boolean(editingRecording)}
      />

      <DeleteModal
        open={Boolean(deletingRecording)}
        onOpenChange={(open) => {
          if (!open && !mutations.deletingRecordingId) {
            setDeletingRecording(null);
          }
        }}
        title="Delete recording"
        description={`Delete "${
          deletingRecording?.title || "this recording"
        }"? This removes it from the recordings list.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={Boolean(mutations.deletingRecordingId)}
      />

      <div className="px-6 py-6">
        {recordingItems.length === 0 ? (
          <RecordingEmptyState />
        ) : (
          <>
            <RecordedStreamsList
              canManageRecordings={canManageRecordings}
              deletingRecordingId={mutations.deletingRecordingId}
              onDelete={setDeletingRecording}
              onEdit={openEditDialog}
              recordings={paginatedRecordings}
            />

            <RecordedStreamsPagination
              currentPage={safeCurrentPage}
              from={pageFrom}
              lastPage={totalPages}
              onPageChange={setCurrentPage}
              perPage={perPage}
              to={pageTo}
              total={recordingItems.length}
            />
          </>
        )}
      </div>
    </section>
  );
}
