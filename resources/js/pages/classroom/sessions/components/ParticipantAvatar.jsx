import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function initials(name) {
    return name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function getAvatarColor(seed) {
    const colors = [
        'bg-amber-100 text-amber-950',
        'bg-blue-100 text-blue-950',
        'bg-emerald-100 text-emerald-950',
        'bg-purple-100 text-purple-950',
        'bg-rose-100 text-rose-950',
        'bg-cyan-100 text-cyan-950',
    ];

    const value = String(seed ?? 'user');

    const index =
        value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        colors.length;

    return colors[index];
}

function resolveAvatarUrl(participant, user) {
    const resolvedUser = user?.user ?? user;
    const candidates = [
        participant?.avatar,
        participant?.avatar_url,
        participant?.photo,
        participant?.photo_url,
        participant?.profile_photo_url,
        participant?.image,
        participant?.user?.avatar,
        participant?.user?.avatar_url,
        participant?.user?.photo,
        participant?.user?.photo_url,
        participant?.user?.profile_photo_url,
        participant?.user?.image,
        resolvedUser?.avatar,
        resolvedUser?.avatar_url,
        resolvedUser?.photo,
        resolvedUser?.photo_url,
        resolvedUser?.profile_photo_url,
        resolvedUser?.image,
    ];

    return candidates.find(
        (candidate) => typeof candidate === 'string' && candidate.trim(),
    );
}

export default function ParticipantAvatar({
    participant,
    user,
    isHost = false,
    size = 'medium',
    className,
    fallbackClassName,
    imageClassName,
}) {
    const avatarSizeClass =
        size === 'small' ? 'size-7' : size === 'medium' ? 'size-8' : 'size-9';

    const resolvedUser = user?.user ?? user;
    const isHostUser = Boolean(isHost || resolvedUser?.role === 'host');
    const avatarUrl = resolveAvatarUrl(participant, user);
    const fallbackBaseClass = isHostUser
        ? 'bg-amber-100 text-amber-950'
        : getAvatarColor(resolvedUser?.id ?? resolvedUser?.name ?? user?.id ?? user?.name);

    return (
        <Avatar className={cn(avatarSizeClass, className)}>
            {avatarUrl && (
                <AvatarImage
                    src={avatarUrl}
                    alt={resolvedUser?.name ?? 'Participant'}
                    className={cn('object-cover', imageClassName)}
                />
            )}
            <AvatarFallback
                className={cn(
                    fallbackBaseClass,
                    fallbackClassName,
                )}
            >
                <svg
                    className={cn('fill-current', size === 'small' ? 'h-4 w-4' : 'h-5 w-5')}
                    viewBox="0 0 301 302"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <g transform="translate(0,325) scale(0.1,-0.1)">
                        <path d="M705 3008 c-41 -120 -475 -1467 -475 -1474 1 -9 1238 -910 1257 -916 6 -2 294 203 640 454 l631 458 -84 257 c-46 142 -154 477 -241 745 l-158 488 -783 0 c-617 0 -784 -3 -787 -12z m1265 -412 c0 -3 65 -205 145 -451 80 -245 145 -448 145 -450 0 -2 -173 -130 -384 -283 l-384 -280 -384 279 c-283 207 -382 284 -380 297 5 22 283 875 289 885 4 7 953 10 953 3z" />
                        <path d="M1176 1661 c21 -15 101 -74 178 -130 l139 -101 31 23 c17 13 92 68 166 122 74 54 139 102 144 106 6 5 -145 9 -344 9 l-354 0 40 -29z" />
                    </g>
                </svg>
            </AvatarFallback>
        </Avatar>
    );
}
