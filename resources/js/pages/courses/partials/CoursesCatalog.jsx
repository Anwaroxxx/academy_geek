import SortViewMenu from '@/components/SortViewMenu';
import { TransText } from '@/components/TransText';
import {
    courseFilterOptions,
    courseSortOptions,
    courseViewOptions,
} from './courseHelpers';
import CourseFilters from './CourseFilters';
import EmptyCourses from './EmptyCourses';
import EmptyFilter from './EmptyFilter';

export default function CoursesCatalog({
    courses,
    visibleCourses,
    viewMode,
    sortValue,
    statusFilter,
    onStatusFilterChange,
    onSortChange,
    onViewChange,
    onReset,
    onCreate,
    renderCourse,
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-border  shadow-xs">
            <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        <TransText
                            en="Course catalog"
                            fr="Course catalog"
                            ar="Course catalog"
                        />
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {visibleCourses.length} / {courses.length}{' '}
                        <TransText
                            en="courses ready to manage."
                            fr="courses ready to manage."
                            ar="courses ready to manage."
                        />
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <CourseFilters
                        value={statusFilter}
                        options={courseFilterOptions}
                        onChange={onStatusFilterChange}
                    />
                    <SortViewMenu
                        sortOptions={courseSortOptions}
                        sortValue={sortValue}
                        onSortChange={onSortChange}
                        viewOptions={courseViewOptions}
                        viewValue={viewMode}
                        onViewChange={onViewChange}
                        triggerLabel={
                            <TransText
                                en="Sort & view"
                                fr="Sort & view"
                                ar="Sort & view"
                            />
                        }
                        sortLabel={
                            <TransText
                                en="Sort By"
                                fr="Sort By"
                                ar="Sort By"
                            />
                        }
                        viewLabel={
                            <TransText
                                en="View As"
                                fr="View As"
                                ar="View As"
                            />
                        }
                        resetLabel={
                            <TransText
                                en="Reset to default"
                                fr="Reset to default"
                                ar="Reset to default"
                            />
                        }
                        onReset={onReset}
                    />
                </div>
            </div>

            {courses.length === 0 ? (
                <EmptyCourses onCreate={onCreate} />
            ) : visibleCourses.length === 0 ? (
                <EmptyFilter />
            ) : (
                <div
                    className={
                        viewMode === 'cards'
                            ? 'grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'
                            : 'grid gap-4 p-4'
                    }
                >
                    {visibleCourses.map(renderCourse)}
                </div>
            )}
        </section>
    );
}
