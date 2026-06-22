import { TransText } from '@/components/TransText';

export const emptyCourseForm = {
    title: '',
    slug: '',
    description: '',
    thumbnail: null,
    estimated_duration_days: '',
    status: 'draft',
};

export const defaultSort = 'recently_active';
export const defaultView = 'banners';

export const courseSortOptions = [
    {
        label: (
            <TransText
                en="Recently Active"
                fr="Recently Active"
                ar="Recently Active"
            />
        ),
        value: 'recently_active',
    },
    {
        label: <TransText en="Date Posted" fr="Date Posted" ar="Date Posted" />,
        value: 'date_posted',
    },
];

export const courseViewOptions = [
    { label: <TransText en="Banners" fr="Banners" ar="Banners" />, value: 'banners' },
    { label: <TransText en="Cards" fr="Cards" ar="Cards" />, value: 'cards' },
];

export const courseFilterOptions = [
    { label: <TransText en="All" fr="All" ar="All" />, value: 'all' },
    { label: <TransText en="Drafted" fr="Drafted" ar="Drafted" />, value: 'draft' },
    {
        label: <TransText en="Published" fr="Published" ar="Published" />,
        value: 'assigned',
    },
    {
        label: <TransText en="Archived" fr="Archived" ar="Archived" />,
        value: 'archived',
    },
];

export const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const courseStatus = (status) =>
    status === 'published' ? 'assigned' : status;

export const courseStatusLabel = (status) =>
    ({
        draft: <TransText en="Draft" fr="Draft" ar="Draft" />,
        assigned: <TransText en="Published" fr="Published" ar="Published" />,
        archived: <TransText en="Archived" fr="Archived" ar="Archived" />,
    })[courseStatus(status)] ?? <TransText en="Draft" fr="Draft" ar="Draft" />;

export const courseStatusStyles = (status) =>
    ({
        draft: 'border-alpha/40 bg-alpha/10 text-alpha',
        assigned: 'border-good/40 bg-good/10 text-good',
        archived: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
    })[courseStatus(status)] ?? 'border-alpha/40 bg-alpha/10 text-alpha';

export const normalizeCoursePayload = (data) => {
    const payload = { ...data };

    if (!(payload.thumbnail instanceof File)) {
        delete payload.thumbnail;
    }

    if (payload.estimated_duration_days === '') {
        payload.estimated_duration_days = null;
    }

    return payload;
};

export const filterAndSortCourses = (courses, sortValue, statusFilter) => {
    const timestampFor = (course) => {
        const date =
            sortValue === 'date_posted' ? course.created_at : course.updated_at;

        return new Date(date).getTime() || 0;
    };

    return courses
        .filter((course) => {
            if (statusFilter === 'all') {
                return true;
            }

            return courseStatus(course.status) === statusFilter;
        })
        .sort(
            (firstCourse, secondCourse) =>
                timestampFor(secondCourse) - timestampFor(firstCourse),
        );
};

export const computeCourseStats = (courses) => ({
    total: courses.length,
    assigned: courses.filter(
        (course) => courseStatus(course.status) === 'assigned',
    ).length,
    drafts: courses.filter((course) => course.status === 'draft').length,
});
