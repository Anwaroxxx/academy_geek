import { RecordedStreamCard } from "./RecordedStreamCard";

export function RecordedStreamsList({
  canManageRecordings,
  deletingRecordingId,
  onDelete,
  onEdit,
  recordings,
}) {
  return (
    <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
      {recordings.map((recording) => (
        <RecordedStreamCard
          key={recording.id}
          canManageRecordings={canManageRecordings}
          deletingRecordingId={deletingRecordingId}
          onDelete={onDelete}
          onEdit={onEdit}
          recording={recording}
        />
      ))}
    </div>
  );
}
