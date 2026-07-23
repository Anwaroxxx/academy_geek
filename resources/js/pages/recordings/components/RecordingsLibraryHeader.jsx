export default function RecordingsLibraryHeader({ recordingCount }) {
    const countLabel =
        recordingCount === 1 ? '1 recording' : `${recordingCount} recordings`;

    return (
        <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b7500] dark:text-amber-300">
                Learning library
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white md:text-5xl">
                Recorded Classroom Library
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400 md:text-base md:leading-7">
                Recorded classroom sessions will appear here once coaches make
                them available for students.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm font-medium text-[#806200] dark:text-amber-200">
                {countLabel} available
            </p>
        </header>
    );
}
