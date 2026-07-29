import VideoSection from './VideoSection';
import LessonTabs from './LessonTabs';

export default function TopicWorkspace({
    concept,
    topic,
    quizzes = [],
    onUpdateTopic,
}) {
    if (!topic) {
        return (
            <main className="flex flex-1 items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                        No lesson selected
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Add a lesson from the sidebar to start building.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-5xl space-y-5">
                    <VideoSection topic={topic} onUpdateTopic={onUpdateTopic} />

                    <LessonTabs
                        concept={concept}
                        topic={topic}
                        quizzes={quizzes}
                        onUpdateTopic={onUpdateTopic}
                    />
                </div>
            </div>
        </main>
    );
}
