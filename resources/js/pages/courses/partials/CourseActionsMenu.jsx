import {
    Archive,
    CheckCircle2,
    Edit3,
    Eye,
    FileText,
    Trash2,
} from 'lucide-react';
import ContextActionMenu from '@/components/ContextActionMenu';
import { TransText } from '@/components/TransText';

export default function CourseActionsMenu({
    menu,
    onClose,
    onReview,
    onEdit,
    onDraft,
    onPublish,
    onArchive,
    onDelete,
}) {
    return (
        <ContextActionMenu
            menu={menu}
            onClose={onClose}
            actions={[
                {
                    id: 'review',
                    label: (
                        <TransText
                            en="Review course"
                            fr="Review course"
                            ar="Review course"
                        />
                    ),
                    icon: <Eye className="size-4" />,
                    onSelect: onReview,
                },
                {
                    id: 'edit',
                    label: (
                        <TransText
                            en="Edit course"
                            fr="Edit course"
                            ar="Edit course"
                        />
                    ),
                    icon: <Edit3 className="size-4" />,
                    onSelect: onEdit,
                },
                {
                    id: 'draft',
                    label: (
                        <TransText
                            en="Mark as draft"
                            fr="Mark as draft"
                            ar="Mark as draft"
                        />
                    ),
                    icon: <FileText className="size-4" />,
                    onSelect: onDraft,
                },
                {
                    id: 'publish',
                    label: (
                        <TransText
                            en="Publish course"
                            fr="Publish course"
                            ar="Publish course"
                        />
                    ),
                    icon: <CheckCircle2 className="size-4" />,
                    onSelect: onPublish,
                },
                {
                    id: 'archive',
                    label: (
                        <TransText
                            en="Archive course"
                            fr="Archive course"
                            ar="Archive course"
                        />
                    ),
                    icon: <Archive className="size-4" />,
                    onSelect: onArchive,
                },
                {
                    id: 'delete',
                    label: (
                        <TransText
                            en="Delete course"
                            fr="Delete course"
                            ar="Delete course"
                        />
                    ),
                    icon: <Trash2 className="size-4" />,
                    variant: 'danger',
                    onSelect: onDelete,
                },
            ]}
            widthClass="w-48"
        />
    );
}
