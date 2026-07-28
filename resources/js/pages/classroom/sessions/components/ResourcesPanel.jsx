import { useRef, useState } from 'react';
import {
    ArrowRight,
    Download,
    FileArchive,
    FileText,
    Link2,
    Trash2,
    Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.zip'];
const ACCEPTED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
];

function formatBytes(bytes) {
    if (!bytes) {
        return '—';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function resourceIcon(type) {
    if (type === 'link') {
        return Link2;
    }

    if (type === 'zip' || type === 'archive') {
        return FileArchive;
    }

    return FileText;
}

function isAcceptedFile(file) {
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;

    return (
        ACCEPTED_EXTENSIONS.includes(extension) ||
        ACCEPTED_MIME_TYPES.includes(file.type)
    );
}

export default function ResourcesPanel({
    resources = [],
    permissions,
    isUploading,
    isDeleting,
    onUploadResource,
    onDeleteResource,
    className,
}) {
    const fileInputRef = useRef(null);
    const [pendingUploads, setPendingUploads] = useState([]);
    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [error, setError] = useState(null);
    const canUpload = permissions?.can_upload_resource ?? true;
    const canDelete = permissions?.can_upload_resource ?? false;

    const handlePickFiles = () => {
        fileInputRef.current?.click();
    };

    const uploadFile = async (file) => {
        const pendingId = `pending-${Date.now()}-${file.name}`;
        const formData = new FormData();

        formData.append('title', file.name);
        formData.append('type', 'file');
        formData.append('file', file);

        setPendingUploads((items) => [
            ...items,
            {
                id: pendingId,
                title: file.name,
                type: file.name.split('.').pop()?.toLowerCase() ?? 'file',
                size_bytes: file.size,
                status: 'uploading',
            },
        ]);

        const resource = await onUploadResource?.(formData);

        setPendingUploads((items) =>
            items.filter((item) => item.id !== pendingId),
        );

        if (!resource) {
            setError(`${file.name} could not be uploaded.`);
        }
    };

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files ?? []);
        const accepted = files.filter(isAcceptedFile);

        if (accepted.length === 0) {
            event.target.value = '';
            return;
        }

        setError(null);

        await Promise.all(accepted.map((file) => uploadFile(file)));

        event.target.value = '';
    };

    const handleCreateLink = async (event) => {
        event.preventDefault();

        const title = linkTitle.trim();
        const externalUrl = linkUrl.trim();

        if (!title || !externalUrl || !canUpload || isUploading) {
            return;
        }

        const formData = new FormData();

        formData.append('title', title);
        formData.append('type', 'link');
        formData.append('external_url', externalUrl);

        setError(null);
        const resource = await onUploadResource?.(formData);

        if (!resource) {
            setError('Link could not be shared.');
            return;
        }

        setLinkTitle('');
        setLinkUrl('');
    };

    const handleDelete = async (resource) => {
        setError(null);
        const response = await onDeleteResource?.(resource);

        if (!response) {
            setError(`${resource.title} could not be removed.`);
        }
    };

    const allResources = [...resources, ...pendingUploads];

    return (
        <section
            className={cn(
                'flex min-h-[320px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <h2 className="font-semibold">Resources</h2>

                <div className="shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={ACCEPTED_EXTENSIONS.join(',')}
                        multiple
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!canUpload || isUploading}
                        onClick={handlePickFiles}
                    >
                        <Upload className="size-4" />
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>

            {canUpload && (
                <form
                    onSubmit={handleCreateLink}
                    className="grid gap-2 border-b p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                >
                    <input
                        value={linkTitle}
                        onChange={(event) => setLinkTitle(event.target.value)}
                        placeholder="Link title"
                        className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        disabled={isUploading}
                    />
                    <input
                        value={linkUrl}
                        onChange={(event) => setLinkUrl(event.target.value)}
                        placeholder="https://..."
                        className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        disabled={isUploading}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={
                            !linkTitle.trim() ||
                            !linkUrl.trim() ||
                            isUploading
                        }
                        className="bg-amber-400 text-amber-950 hover:bg-amber-500"
                    >
                        <Link2 className="size-4" />
                        Share
                    </Button>
                </form>
            )}

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {error && (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                {allResources.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No resources shared yet. Upload PDF, DOC, DOCX, TXT, or
                        ZIP files.
                    </p>
                )}

                {allResources.map((resource) => {
                    const Icon = resourceIcon(resource.type);
                    const isPending = Boolean(resource.status);

                    return (
                        <div
                            key={resource.id}
                            className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5"
                        >
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-lg',
                                    resource.type === 'link'
                                        ? 'bg-violet-100 text-violet-700'
                                        : resource.type === 'zip'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-red-100 text-red-700',
                                )}
                            >
                                <Icon className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {resource.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isPending
                                        ? 'Uploading...'
                                        : formatBytes(resource.size_bytes)}
                                </p>
                            </div>

                            {isPending ? (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                    Pending
                                </span>
                            ) : (
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                    >
                                        <a
                                            href={resource.download_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="size-4" />
                                            <span className="sr-only">
                                                Download {resource.title}
                                            </span>
                                        </a>
                                    </Button>

                                    {canDelete && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isDeleting}
                                            onClick={() =>
                                                handleDelete(resource)
                                            }
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                            <span className="sr-only">
                                                Remove {resource.title}
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="border-t px-4 py-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                    View all resources
                    <ArrowRight className="size-4" />
                </button>
            </div>
        </section>
    );
}
