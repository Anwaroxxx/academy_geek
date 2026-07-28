import { Head } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import ClassroomHeader from './components/ClassroomHeader';
import ClassroomVideoStage from './components/ClassroomVideoStage';
import DesktopClassroomLayout from './components/DesktopClassroomLayout';
import StackedClassroomLayout from './components/StackedClassroomLayout';
import { buildPendingClassroomState } from './classroomHelpers';
import useBreakpoint from './hooks/useBreakpoint';
import useClassroomActions from './hooks/useClassroomActions';
import useClassroomData from './hooks/useClassroomData';
import useJitsiSync from './hooks/useJitsiSync';

export default function ClassroomSession({
    data = {},
    classroom = {},
    jitsiAccess = null,
}) {
    const mappedClassroom = useMemo(
        () => buildPendingClassroomState(data, classroom),
        [data, classroom],
    );

    const [chatFilterParticipant, setChatFilterParticipant] = useState(null);
    const [activeMobilePanel, setActiveMobilePanel] = useState('chat');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [activeFocusOverlay, setActiveFocusOverlay] = useState(null);
    const classroomDataRef = useRef(null);
    const jitsiSyncRef = useRef(null);
    const canStartRoomFromAccess = Boolean(
        jitsiAccess?.can_start_room || jitsiAccess?.is_host,
    );
    const initialRoomIsLive = Boolean(
        jitsiAccess?.room_is_live || jitsiAccess?.host_is_online,
    );

    const {
        handleJoin,
        handleLeave,
        handleModerateParticipant,
        isJoined,
        isModeratingParticipant,
        isStartingRoom,
        isStoppingRoom,
        roomIsLive,
        streamEndedByStaff,
    } = useClassroomActions({
        canStartRoom: canStartRoomFromAccess,
        classId: data.id,
        getClassroomData: () => classroomDataRef.current,
        getJitsiSync: () => jitsiSyncRef.current,
        initialIsJoined: Boolean(
            mappedClassroom.currentParticipant?.is_online && initialRoomIsLive,
        ),
        initialRoomIsLive,
        onLocalLeave: () => {
            setIsFocusMode(false);
            setActiveFocusOverlay(null);
        },
    });

    const {
        applyCurrentParticipantUpdate,
        applyJitsiParticipantMediaPayload,
        applyParticipantResponse,
        canShareScreen,
        canStartRoom,
        classroomPermissions,
        currentParticipant,
        jitsiAccessForRoom,
        participants,
        selectedParticipant,
        setSelectedParticipant,
    } = useClassroomData({
        jitsiAccess,
        mappedClassroom,
        roomIsLive,
    });
    classroomDataRef.current = {
        applyCurrentParticipantUpdate,
        applyJitsiParticipantMediaPayload,
        applyParticipantResponse,
        canShareScreen,
        canStartRoom,
        classroomPermissions,
        currentParticipant,
        jitsiAccessForRoom,
        participants,
        selectedParticipant,
        setSelectedParticipant,
    };

    const { isDesktop, isTablet, isMobile } = useBreakpoint();
    const showNativeRecordingControl = Boolean(
        isJoined && jitsiAccess?.can_record && !isMobile,
    );

    const {
        onJitsiApiReady,
        onJitsiApiDisposed,
        onJitsiMediaStateChange,
        stopScreenSharingForRevokedPermission,
        syncJitsiParticipantUpdate,
    } = useJitsiSync({
        canShareScreen,
        isJoined,
        participant: currentParticipant,
        onParticipantMediaChange: applyJitsiParticipantMediaPayload,
    });
    jitsiSyncRef.current = {
        onJitsiApiReady,
        onJitsiApiDisposed,
        onJitsiMediaStateChange,
        stopScreenSharingForRevokedPermission,
        syncJitsiParticipantUpdate,
    };

    const handleUpdateParticipant = (payload) => {
        if (!syncJitsiParticipantUpdate(payload)) {
            return;
        }

        applyCurrentParticipantUpdate(payload);
    };

    const handleToggleMobilePanel = (panel) => {
        setActiveMobilePanel((value) => (value === panel ? null : panel));
    };

    const revealFocusControls = () => undefined;
    const disabledAction = () => null;

    const videoStage = (
        <ClassroomVideoStage
            isDesktop={isDesktop}
            isFocusMode={isFocusMode}
            session={mappedClassroom.session}
            jitsiAccess={jitsiAccessForRoom}
            streamEndedByStaff={streamEndedByStaff}
            currentParticipant={currentParticipant}
            currentUser={mappedClassroom.currentUser}
            participants={participants}
            isJoined={isJoined}
            permissions={classroomPermissions}
            canJoin={mappedClassroom.permissions.can_join}
            isJoining={isStartingRoom}
            onJoin={handleJoin}
            onJitsiApiReady={onJitsiApiReady}
            onJitsiApiDisposed={onJitsiApiDisposed}
            onJitsiMediaStateChange={onJitsiMediaStateChange}
            isParticipantUpdating={false}
            isLeaving={isStoppingRoom}
            areFocusControlsVisible
            isJoinedHostWithNativeRecordingControl={
                showNativeRecordingControl
            }
            onUpdateParticipant={handleUpdateParticipant}
            onToggleFocusMode={() => setIsFocusMode((value) => !value)}
            revealFocusControls={revealFocusControls}
            onLeave={handleLeave}
            activeFocusOverlay={activeFocusOverlay}
            setActiveFocusOverlay={setActiveFocusOverlay}
            messages={mappedClassroom.messages}
            isSendingMessage={false}
            onSendMessage={disabledAction}
            chatFilterParticipant={chatFilterParticipant}
            setChatFilterParticipant={setChatFilterParticipant}
            onEditMessage={disabledAction}
            onDeleteMessage={disabledAction}
            isModeratingParticipant={isModeratingParticipant}
            onModerateParticipant={handleModerateParticipant}
        />
    );

    return (
        <>
            <Head title={mappedClassroom.session.title} />

            <div className="min-h-screen bg-background text-foreground">
                {!isFocusMode && (
                    <ClassroomHeader
                        session={mappedClassroom.session}
                        currentUser={mappedClassroom.currentUser}
                        currentParticipant={currentParticipant}
                        isJoined={isJoined}
                    />
                )}

                <div className="mx-4 mt-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 md:mx-6">
                    {mappedClassroom.pendingMessage}
                </div>

                <div
                    className={cn(
                        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto',
                        isFocusMode
                            ? 'p-3 md:p-4'
                            : cn(
                                  'p-4 md:p-6',
                                  isMobile && 'pb-24',
                                  isDesktop &&
                                      'grid grid-cols-[minmax(0,1fr)_320px] grid-rows-[minmax(0,1fr)] overflow-hidden',
                              ),
                    )}
                >
                    {!isFocusMode && isDesktop ? (
                        <DesktopClassroomLayout
                            videoStage={videoStage}
                            resources={mappedClassroom.resources}
                            messages={mappedClassroom.messages}
                            currentUser={mappedClassroom.currentUser}
                            permissions={classroomPermissions}
                            participants={participants}
                            selectedParticipant={selectedParticipant}
                            onSelectParticipant={setSelectedParticipant}
                            isUploadingResource={false}
                            isDeletingResource={false}
                            onUploadResource={disabledAction}
                            onDeleteResource={disabledAction}
                            isSendingMessage={false}
                            onSendMessage={disabledAction}
                            isModeratingParticipant={isModeratingParticipant}
                            onModerateParticipant={handleModerateParticipant}
                        />
                    ) : !isFocusMode ? (
                        <StackedClassroomLayout
                            videoStage={videoStage}
                            isTablet={isTablet}
                            isMobile={isMobile}
                            activeMobilePanel={activeMobilePanel}
                            onToggleMobilePanel={handleToggleMobilePanel}
                            resources={mappedClassroom.resources}
                            messages={mappedClassroom.messages}
                            currentUser={mappedClassroom.currentUser}
                            permissions={classroomPermissions}
                            participants={participants}
                            isUploadingResource={false}
                            isDeletingResource={false}
                            onUploadResource={disabledAction}
                            onDeleteResource={disabledAction}
                            isSendingMessage={false}
                            onSendMessage={disabledAction}
                            isModeratingParticipant={isModeratingParticipant}
                            onModerateParticipant={handleModerateParticipant}
                        />
                    ) : (
                        <div
                            className={cn(
                                'flex min-w-0 flex-1 flex-col gap-4',
                                isDesktop && 'h-full min-h-0',
                            )}
                        >
                            {videoStage}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
