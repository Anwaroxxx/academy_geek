import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BannerVisual({ imageUrl, className = 'h-56' }) {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [imageUrl]);

    return (
        <div className={`relative overflow-hidden bg-muted ${className}`}>
            {imageUrl && !imageFailed ? (
                <>
                    <img
                        src={imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-md"
                    />
                    <img
                        src={imageUrl}
                        alt=""
                        onError={() => setImageFailed(true)}
                        className="relative h-full w-full object-contain"
                    />
                </>
            ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--color-alpha)_0%,var(--color-alpha)_42%,var(--color-background)_42%,var(--color-background)_100%)]">
                    <ImageIcon className="size-10 text-foreground/70" />
                </div>
            )}
        </div>
    );
}
