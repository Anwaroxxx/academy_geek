import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';
import ResourcesPanel from './ResourcesPanel';

export default function DesktopClassroomLayout({
    videoStage,
    resources,
    messages,
    currentUser,
    permissions,
    participants,
    selectedParticipant,
    onSelectParticipant,
    isUploadingResource,
    isDeletingResource,
    onUploadResource,
    onDeleteResource,
    isSendingMessage,
    onSendMessage,
    isModeratingParticipant,
    onModerateParticipant,
}) {
    return (
        <>
            <div className="flex min-w-0 flex-1 flex-col gap-4 h-full min-h-0">
                {videoStage}

                {/* Desktop: chat & resources always visible side by side under the video */}
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 rounded-2xl">
                    <ResourcesPanel
                        resources={resources}
                        permissions={permissions}
                        isUploading={isUploadingResource}
                        isDeleting={isDeletingResource}
                        onUploadResource={onUploadResource}
                        onDeleteResource={onDeleteResource}
                        className="flex h-full min-h-0"
                    />
                    <ChatPanel
                        messages={messages}
                        currentUser={currentUser}
                        permissions={permissions}
                        isSending={isSendingMessage}
                        onSendMessage={onSendMessage}
                        className="flex h-full w-[860px] flex-1"
                    />
                </div>
            </div>

            {/* Desktop: participants sidebar always visible on the right */}
            <aside
                className="flex h-[619px] w-full  shrink-0 flex-col gap-4 rounded-2xl"
                role="region"
                aria-label="Participants"
            >
                <ParticipantsPanel
                    participants={participants}
                    currentUser={currentUser}
                    permissions={permissions}
                    selectedParticipant={selectedParticipant}
                    onSelectParticipant={onSelectParticipant}
                    isModerating={isModeratingParticipant}
                    onModerateParticipant={onModerateParticipant}
                    className="flex  h-[100px] flex-1"
                />
            </aside>
        </>
    );
}
