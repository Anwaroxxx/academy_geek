import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Quizes from '@/components/quizes';
import AppLayout from '@/layouts/app-layout';
import { index as quizesIndex } from '@/routes/quizes';

export default function QuizesIndex({ quizzes }) {
    const { topics } = usePage().props;
    const [selectedTopicId, setSelectedTopicId] = useState(
        topics?.[0]?.id ?? '',
    );
    console.log(quizzes);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Quizzes',
                    href: quizesIndex(),
                },
            ]}
        >
            <Head title="Quizzes" />

            <div className="min-h-screen p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <select
                        value={selectedTopicId}
                        onChange={(e) => setSelectedTopicId(e.target.value)}
                        className="rounded-lg border border-beta/20 bg-transparent px-3 py-2 text-sm text-beta dark:text-light"
                    >
                        <option value="">Select topic</option>

                        {topics?.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.title}
                            </option>
                        ))}
                    </select>

                    <Quizes topicId={selectedTopicId} />
                </div>
            </div>
        </AppLayout>
    );
}
