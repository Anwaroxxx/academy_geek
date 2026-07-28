import { cn } from '@/lib/utils';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';
import ResourcesPanel from './ResourcesPanel';
import ClassroomTabBar from './ClassroomTabBar';

export default function StackedClassroomLayout({
    videoStage,
    isTablet,
    isMobile,
    activeMobilePanel,
    onToggleMobilePanel,
    resources,
    messages,
    currentUser,
    permissions,
    participants,
    isUploadingResource,
    isDeletingResource,
    onUploadResource,
    onDeleteResource,
    isSendingMessage,
    onSendMessage,
    isModeratingParticipant,
    onModerateParticipant,
}) {
    const isChatOrResourcesPanelActive =
        activeMobilePanel === 'chat' || activeMobilePanel === 'resources';

    const isParticipantsPanelActive = activeMobilePanel === 'participants';

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            {videoStage}

            {/* Tablet only: original in-flow tab bar, directly
                above the active panel. */}
            {isTablet && (
                <ClassroomTabBar
                    activePanel={activeMobilePanel}
                    onTogglePanel={onToggleMobilePanel}
                    variant="inline"
                />
            )}

            {isChatOrResourcesPanelActive && (
                <div
                    className="grid  min-h-[420px] w-full flex-1 grid-cols-1 gap-4 "
                    role="region"
                    aria-label="Active classroom utility panel"
                >
                    <ResourcesPanel
                        resources={resources}
                        permissions={permissions}
                        isUploading={isUploadingResource}
                        isDeleting={isDeletingResource}
                        onUploadResource={onUploadResource}
                        onDeleteResource={onDeleteResource}
                        className={cn(
                            activeMobilePanel === 'resources'
                                ? 'flex'
                                : 'hidden',
                            'h-full   min-h-0',
                        )}
                        
                    />
                    <ChatPanel
                        messages={messages}
                        currentUser={currentUser}
                        permissions={permissions}
                        isSending={isSendingMessage}
                        onSendMessage={onSendMessage}
                        className={cn(
                               activeMobilePanel === 'chat'
                                ? 'flex h-full min-h-0'
                                : 'hidden ',
                            'h-full w-full min-h-0',
                        )}
                    />
                </div>
            )}

            {isParticipantsPanelActive && (
                <div
                    className="min-h-[420px]  flex-1"
                    role="region"
                    aria-label="Active classroom utility panel"
                >
                    <ParticipantsPanel
                        participants={participants}
                        currentUser={currentUser}
                        permissions={permissions}
                        isModerating={isModeratingParticipant}
                        onModerateParticipant={onModerateParticipant}
                        className="xl:h-full xl:min-h-0"

                    />
                </div>
            )}

            {isMobile && (
                <ClassroomTabBar
                    activePanel={activeMobilePanel}
                    onTogglePanel={onToggleMobilePanel}
                    variant="fixed"
                />
            )}
        </div>
    );
}
