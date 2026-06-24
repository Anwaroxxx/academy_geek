import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Banner from '@/components/ui/banner';
import DeleteModal from '@/components/DeleteModal';
import { TransText } from '@/components/TransText';
import AppLayout from '@/layouts/app-layout';
import { index as coursesIndex } from '@/routes/courses';
import illustration from '../../../../public/assets/images/banner/Lesson-bro.png';
import CourseActionsMenu from './partials/CourseActionsMenu';
import CourseCard from './partials/CourseCard';
import CoursesCatalog from './partials/CoursesCatalog';
import CoursesHeader from './partials/CoursesHeader';
import CourseGalleryCard from './partials/CourseGalleryCard';
import CourseModal from './partials/CourseModal';
import CourseReviewModal from './partials/CourseReviewModal';
import {
    computeCourseStats,
    courseStatus,
    courseStatusLabel,
    courseStatusStyles,
    defaultSort,
    defaultView,
    emptyCourseForm,
    filterAndSortCourses,
    normalizeCoursePayload,
    slugify,
} from './partials/courseHelpers';

const catalogPreferencesKey = 'courses.catalog.preferences';
const validSortValues = ['recently_active', 'date_posted'];
const validViewModes = ['banners', 'cards'];
const validStatusFilters = ['all', 'draft', 'assigned', 'archived'];

const readCatalogPreferences = () => {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        return JSON.parse(
            window.localStorage.getItem(catalogPreferencesKey) ?? '{}',
        );
    } catch {
        return {};
    }
};

export default function CoursesIndex({ courses = [] }) {
    const [storedPreferences] = useState(readCatalogPreferences);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseToReview, setCourseToReview] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [courseMenu, setCourseMenu] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [sortValue, setSortValue] = useState(
        validSortValues.includes(storedPreferences.sortValue)
            ? storedPreferences.sortValue
            : defaultSort,
    );
    const [viewMode, setViewMode] = useState(
        validViewModes.includes(storedPreferences.viewMode)
            ? storedPreferences.viewMode
            : defaultView,
    );
    const [statusFilter, setStatusFilter] = useState(
        validStatusFilters.includes(storedPreferences.statusFilter)
            ? storedPreferences.statusFilter
            : 'all',
    );

    const form = useForm(emptyCourseForm);
    const isEditing = Boolean(editingCourse);

    const stats = useMemo(() => computeCourseStats(courses), [courses]);

    const visibleCourses = useMemo(
        () => filterAndSortCourses(courses, sortValue, statusFilter),
        [courses, sortValue, statusFilter],
    );

    useEffect(() => {
        window.localStorage.setItem(
            catalogPreferencesKey,
            JSON.stringify({
                sortValue,
                viewMode,
                statusFilter,
            }),
        );
    }, [sortValue, viewMode, statusFilter]);

    const resetFilters = () => {
        setSortValue(defaultSort);
        setViewMode(defaultView);
        setStatusFilter('all');
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        form.clearErrors();
        form.setData(emptyCourseForm);
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setCourseMenu(null);
        setEditingCourse(course);
        form.clearErrors();
        form.setData({
            title: course.title ?? '',
            slug: course.slug ?? '',
            description: course.description ?? '',
            thumbnail: null,
            estimated_duration_days: course.estimated_duration_days ?? '',
            status: courseStatus(course.status) ?? 'draft',
        });
        setModalOpen(true);
    };

    const openCourseMenu = (event, course) => {
        event.preventDefault();

        setCourseMenu({
            item: course,
            x: Math.min(event.clientX, window.innerWidth - 180),
            y: Math.min(event.clientY, window.innerHeight - 112),
        });
    };

    const openCourseMenuFromButton = (event, course) => {
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();

        setCourseMenu({
            item: course,
            x: Math.min(rect.right - 180, window.innerWidth - 180),
            y: Math.min(rect.bottom + 8, window.innerHeight - 224),
        });
    };

    const closeCourseModal = () => {
        setModalOpen(false);
        setEditingCourse(null);
        form.clearErrors();
        form.setData(emptyCourseForm);
    };

    const updateField = (field, value) => {
        form.setData(field, value);

        if (field === 'title' && !isEditing) {
            form.setData('slug', slugify(value));
        }
    };

    const submitCourse = (event) => {
        event.preventDefault();

        form.transform(normalizeCoursePayload);

        if (isEditing) {
            form.post(`/courses/${editingCourse.id}/update`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeCourseModal,
                onFinish: () => form.transform((data) => data),
            });

            return;
        }

        form.post('/courses', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeCourseModal,
            onFinish: () => form.transform((data) => data),
        });
    };

    const deleteCourse = () => {
        if (!courseToDelete) {
            return Promise.resolve();
        }

        setDeleteProcessing(true);

        return new Promise((resolve, reject) => {
            router.delete(`/courses/${courseToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setCourseToDelete(null);
                    resolve();
                },
                onError: (errors) => reject(errors),
                onFinish: () => setDeleteProcessing(false),
            });
        });
    };

    const openReviewModal = (course) => {
        setCourseMenu(null);
        setCourseToReview(course);
    };

    const updateCourseStatus = (course, status) => {
        setCourseMenu(null);

        router.patch(
            `/courses/${course.id}/status`,
            { status },
            { preserveScroll: true },
        );
    };

    const renderCourse = (course) => {
        const cardProps = {
            course,
            statusLabel: courseStatusLabel,
            statusStyles: courseStatusStyles,
            onOpenMenu: (event) => openCourseMenu(event, course),
            onOpenMenuFromButton: (event) =>
                openCourseMenuFromButton(event, course),
            onReview: () => openReviewModal(course),
        };

        return viewMode === 'cards' ? (
            <CourseGalleryCard key={course.id} {...cardProps} />
        ) : (
            <CourseCard key={course.id} {...cardProps} />
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Courses',
                    href: coursesIndex(),
                },
            ]}
        >
            <Head title="Courses" />

            <div className="min-h-screen bg-light dark:bg-dark p-4 md:p-6">
                <CoursesHeader stats={stats} onCreate={openCreateModal} />
                <Banner
                    illustration={illustration}
                    size={400}
                    title="Courses"
                    description="Manage reusable courses before assigning them to promotions."
                />


                <CoursesCatalog
                    courses={courses}
                    visibleCourses={visibleCourses}
                    viewMode={viewMode}
                    sortValue={sortValue}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onSortChange={setSortValue}
                    onViewChange={setViewMode}
                    onReset={resetFilters}
                    onCreate={openCreateModal}
                    renderCourse={renderCourse}
                />
            </div>

            <CourseModal
                open={modalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeCourseModal();
                    } else {
                        setModalOpen(true);
                    }
                }}
                form={form}
                isEditing={isEditing}
                onSubmit={submitCourse}
                onUpdateField={updateField}
            />

            <CourseActionsMenu
                menu={courseMenu}
                onClose={() => setCourseMenu(null)}
                onReview={(course) => openReviewModal(course)}
                onEdit={(course) => openEditModal(course)}
                onDraft={(course) => updateCourseStatus(course, 'draft')}
                onPublish={(course) => updateCourseStatus(course, 'assigned')}
                onArchive={(course) => updateCourseStatus(course, 'archived')}
                onDelete={(course) => {
                    setCourseMenu(null);
                    setCourseToDelete(course);
                }}
            />

            <DeleteModal
                open={Boolean(courseToDelete)}
                onOpenChange={(open) => !open && setCourseToDelete(null)}
                title={
                    <TransText
                        en="Delete course"
                        fr="Delete course"
                        ar="Delete course"
                    />
                }
                description={
                    <>
                        <TransText en="Delete" fr="Delete" ar="Delete" /> "
                        {courseToDelete?.title ?? (
                            <TransText
                                en="this course"
                                fr="this course"
                                ar="this course"
                            />
                        )}
                        "?{' '}
                        <TransText
                            en="This action cannot be undone."
                            fr="This action cannot be undone."
                            ar="This action cannot be undone."
                        />
                    </>
                }
                confirmLabel={
                    <TransText en="Delete" fr="Delete" ar="Delete" />
                }
                cancelLabel={
                    <TransText en="Cancel" fr="Cancel" ar="Cancel" />
                }
                loading={deleteProcessing}
                onConfirm={deleteCourse}
            />

            <CourseReviewModal
                course={courseToReview}
                open={Boolean(courseToReview)}
                onOpenChange={(open) => !open && setCourseToReview(null)}
                statusLabel={courseStatusLabel}
                statusStyles={courseStatusStyles}
            />
        </AppLayout>
    );
}
