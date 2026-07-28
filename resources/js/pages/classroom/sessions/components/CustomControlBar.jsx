import {
    Hand,
    Maximize2,
    Mic,
    MicOff,
    Minimize2,
    MonitorUp,
    PhoneOff,
    Video,
    VideoOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ControlButton({
    active,
    className,
    disabled,
    destructive,
    label,
    onClick,
    children,
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(
                'size-11 rounded-full border  bg-neutral-800/90 text-white shadow-lg backdrop-blur hover:bg-neutral-700 hover:text-white',
                active && 'border-amber-400 bg-amber-400 text-amber-950 hover:bg-amber-400 hover:text-amber-950',
                destructive &&
                    'border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white',
                disabled && 'opacity-50',
                className,
            )}
        >
            {children}
        </Button>
    );
}

export default function CustomControlBar({
    currentParticipant,
    permissions,
    isJoined,
    isLoading,
    isLeaving,
    isFocusMode,
    isVisible = true,
    splitForNativeRecordingControl = false,
    onUpdateParticipant,
    onToggleFocusMode,
    onInteraction,
    onHoldVisibility,
    onLeave,
}) {
    const isMuted = Boolean(currentParticipant?.is_muted);
    const isCameraOn = Boolean(currentParticipant?.is_camera_on);
    const handRaised = Boolean(currentParticipant?.hand_raised);
    const isScreenSharing = Boolean(currentParticipant?.is_screen_sharing);
    const canShareScreen = Boolean(
        permissions?.can_share_screen && currentParticipant?.can_share_screen,
    );
    const disabled = !isJoined || !currentParticipant || isLoading;

    const focusControl = (
        <ControlButton
            label={isFocusMode ? 'Exit focus' : 'Focus mode'}
            active={isFocusMode}
            disabled={!isJoined}
            onClick={onToggleFocusMode}
        >
            {isFocusMode ? (
                <Minimize2 className="size-5" />
            ) : (
                <Maximize2 className="size-5" />
            )}
        </ControlButton>
    );

    const controlGroups = {
        left: (
            <>
                <ControlButton
                    label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    active={isMuted}
                    disabled={disabled}
                    onClick={() =>
                        onUpdateParticipant({
                            is_muted: !isMuted,
                        })
                    }
                >
                    {isMuted ? (
                        <MicOff className="size-5" />
                    ) : (
                        <Mic className="size-5" />
                    )}
                </ControlButton>

                <ControlButton
                    label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
                    active={!isCameraOn}
                    disabled={disabled}
                    onClick={() =>
                        onUpdateParticipant({
                            is_camera_on: !isCameraOn,
                        })
                    }
                >
                    {isCameraOn ? (
                        <Video className="size-5" />
                    ) : (
                        <VideoOff className="size-5" />
                    )}
                </ControlButton>

                <ControlButton
                    label={handRaised ? 'Lower hand' : 'Raise hand'}
                    active={handRaised}
                    disabled={disabled}
                    onClick={() =>
                        onUpdateParticipant({
                            hand_raised: !handRaised,
                        })
                    }
                >
                    <Hand className="size-5" />
                </ControlButton>
            </>
        ),
        right: (
            <>
                <ControlButton
                    label={
                        isScreenSharing
                            ? 'Stop screen sharing'
                            : 'Share screen'
                    }
                    active={isScreenSharing}
                    disabled={disabled || !canShareScreen}
                    onClick={() =>
                        onUpdateParticipant({
                            is_screen_sharing: !isScreenSharing,
                        })
                    }
                >
                    <MonitorUp className="size-5" />
                </ControlButton>

                {focusControl}

                <ControlButton
                    label="Leave session"
                    destructive
                    disabled={!isJoined || isLeaving}
                    onClick={onLeave}
                >
                    <PhoneOff className="size-5" />
                </ControlButton>
            </>
        ),
    };

    const pillClassName = cn(
        'inline-flex items-center  gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-3 py-2 shadow-xl backdrop-blur',
        isVisible ? 'pointer-events-auto' : 'pointer-events-none',
    );
    const splitPillClassName = cn(
        pillClassName,
        '[@media(max-width:639px)_and_(orientation:portrait)]:flex-row   [@media(max-width:639px)_and_(orientation:portrait)]:gap-1 [@media(max-width:639px)_and_(orientation:portrait)]:px-1.5 [@media(max-width:639px)_and_(orientation:portrait)]:py-1.5 [@media(max-width:639px)_and_(orientation:portrait)]:[&_button]:size-9',
    );

    return (
        <div
            className={cn(
                'pointer-events-none justify-center  [@media(max-width:620px)_and_(orientation:portrait)]:flex [@media(max-width:620px)_and_(orientation:portrait)]:justify-center [@media(max-width:439px)_and_(orientation:portrait)]:bottom-8 absolute inset-x-0 z-10 flex px-4 transition-all duration-300 ease-out',
                'bottom-6  [@media(max-width:639px)_and_(orientation:portrait)]:bottom-4',
                isVisible
                    ? 'translate-y-0 opacity-100 '
                    : 'translate-y-4 opacity-0',
           
            )}
            onMouseEnter={onHoldVisibility}
            onMouseLeave={onInteraction}
            onFocusCapture={onHoldVisibility}
            onBlurCapture={onInteraction}
        >
            {splitForNativeRecordingControl ? (
                <div className="grid w-full max-w-1xl  grid-cols-[1fr_minmax(88px,128px)_1fr] items-center gap-3  sm:gap-5 md:max-w-4xl md:grid-cols-[1fr_minmax(112px,160px)_1fr] [@media(max-width:639px)_and_(orientation:portrait)]:contents">
                    <div className="flex justify-end [@media(max-width:639px)_and_(orientation:portrait)]:min-w-0">
                        <div className={splitPillClassName}>
                            {controlGroups.left}
                        </div>
                    </div>
                    <div
                        aria-hidden="true"
                        className="[@media(max-width:639px)_and_(orientation:portrait)]:hidden"
                    />
                    <div className="flex justify-start [@media(max-width:639px)_and_(orientation:portrait)]:min-w-0">
                        <div className={splitPillClassName}>
                            {controlGroups.right}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={pillClassName}>
                    {controlGroups.left}
                    {controlGroups.right}
                </div>
            )}
        </div>
    );
}
