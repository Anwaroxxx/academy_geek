import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { index as coursesIndex } from '@/routes/courses';
import ConceptTopbar from './partials/ConceptTopbar';
import CourseStructureSidebar from './partials/CourseStructureSidebar';
import TopicWorkspace from './partials/TopicWorkspace';

function hasResourceFile(resource) {
    return resource.file && typeof resource.file === 'object';
}

function appendFormValue(formData, key, value) {
    if (value === null || value === undefined) {
        formData.append(key, '');
        return;
    }

    formData.append(key, value);
}

function buildConceptUploadFormData(payload) {
    const formData = new FormData();

    formData.append('_method', 'put');

    payload.topics.forEach((topic, topicIndex) => {
        Object.entries(topic).forEach(([topicKey, topicValue]) => {
            if (topicKey === 'resources') return;

            appendFormValue(formData, `topics[${topicIndex}][${topicKey}]`, topicValue);
        });

        topic.resources.forEach((resource, resourceIndex) => {
            Object.entries(resource).forEach(([resourceKey, resourceValue]) => {
                if (resourceKey === 'file' && !resourceValue) return;

                appendFormValue(
                    formData,
                    `topics[${topicIndex}][resources][${resourceIndex}][${resourceKey}]`,
                    resourceValue
                );
            });
        });
    });

    return formData;
}

function normalizeTopics(serverTopics = []) {
    return serverTopics.map((topic) => ({
        id: topic.id,
        title: topic.title || '',
        description: topic.description || '',
        order_index: topic.order_index,
        theory: topic.theory ?? '',
        videoUrl: topic.videoUrl ?? '',
        videoFile: null,
        resources: topic.resources || [],
        duration_minutes: topic.duration_minutes ?? null,
        difficulty: topic.difficulty || 'easy',
        status: topic.status || 'draft',
        hasQuiz: Boolean(topic.hasQuiz),
        hasExercise: Boolean(topic.hasExercise),
        exercises: topic.exercises || [],
    }));
}

export default function Concept() {
    const {
        concept: serverConcept,
        topics: serverTopics = [],
        quizzes = [],
        publishableClasses = [],
        errors = {},
    } = usePage().props;

    const concept = serverConcept || null;
    const [topics, setTopics] = useState(() => normalizeTopics(serverTopics));
    const [saveErrors, setSaveErrors] = useState({});

    const [activeTopicId, setActiveTopicId] = useState(
        topics[0]?.id ?? null
    );

    useEffect(() => {
        const normalizedTopics = normalizeTopics(serverTopics);

        setTopics(normalizedTopics);
        setActiveTopicId((currentId) => {
            if (normalizedTopics.some((topic) => topic.id === currentId)) {
                return currentId;
            }

            return normalizedTopics[0]?.id ?? null;
        });
    }, [serverTopics]);

    useEffect(() => {
        if (Object.keys(errors).length === 0) return;

        console.error('Concept Builder validation errors:', errors);
        setSaveErrors(errors);
    }, [errors]);

    const activeTopic =
        topics.find((topic) => topic.id === activeTopicId) || null;

    const addTopic = () => {
        const newId = `tmp-${Date.now()}`;

        const newTopic = {
            id: newId,
            title: '',
            description: '',
            order_index: topics.length + 1,
            theory: '',
            videoUrl: '',
            videoFile: null,
            resources: [],
            duration_minutes: null,
            difficulty: 'easy',
            status: 'draft',
            hasQuiz: false,
            hasExercise: false,
        };

        setTopics((prev) => [...prev, newTopic]);
        setActiveTopicId(newId);
        setSaveErrors({});
    };

    const deleteTopic = (topicId) => {
        setTopics((prev) => {
            const deletedIndex = prev.findIndex((topic) => topic.id === topicId);
            const nextTopics = prev.filter((topic) => topic.id !== topicId);

            if (activeTopicId === topicId) {
                const nextTopic = nextTopics[deletedIndex] || nextTopics[deletedIndex - 1] || nextTopics[0] || null;
                setActiveTopicId(nextTopic?.id ?? null);
            }

            return nextTopics;
        });
        setSaveErrors({});
    };

    const updateTopic = (topicId, updates) => {
        setTopics((prev) =>
            prev.map((topic) =>
                topic.id === topicId
                    ? { ...topic, ...updates }
                    : topic
            )
        );
    };

    const handleSave = () => {
        if (!concept?.id) {
            console.warn('Concept Builder requires an existing concept before saving.');
            return;
        }

        const activeIndex = topics.findIndex((topic) => topic.id === activeTopicId);

        setSaveErrors({});

        const payload = {
            topics: topics.map((topic, index) => ({
                id: typeof topic.id === 'number' ? topic.id : null,
                title: topic.title || 'Untitled lesson',
                description: topic.description,
                theory: topic.theory,
                videoUrl: topic.videoUrl,
                duration_minutes: topic.duration_minutes,
                difficulty: topic.difficulty,
                status: topic.status,
                order_index: index + 1,
                resources: (topic.resources || []).map((resource, resourceIndex) => ({
                    id: typeof resource.id === 'number' ? resource.id : null,
                    type: resource.type,
                    name: resource.name,
                    url: resource.url,
                    meta: resource.meta,
                    file: resource.file ?? null,
                    order_index: resourceIndex + 1,
                })),
            })),
        };

        const saveOptions = {
            onError: (validationErrors) => {
                console.error('Concept Builder save failed:', validationErrors);
                setSaveErrors(validationErrors);
            },
            onSuccess: (page) => {
                const nextTopics = normalizeTopics(page.props?.topics || []);
                const sameTopic = nextTopics.find((topic) => topic.id === activeTopicId);
                const nextActiveTopic = sameTopic || nextTopics[activeIndex] || nextTopics[0] || null;

                console.info('Concept Builder saved successfully.');
                setTopics(nextTopics);
                setActiveTopicId(nextActiveTopic?.id ?? null);
                setSaveErrors({});
            },
        };

        const hasUploadFiles = topics.some((topic) =>
            (topic.resources || []).some((resource) => hasResourceFile(resource))
        );

        if (hasUploadFiles) {
            router.post(`/concept/${concept.id}`, buildConceptUploadFormData(payload), {
                ...saveOptions,
                forceFormData: true,
            });
            return;
        }

        router.put(`/concept/${concept.id}`, payload, saveOptions);
    };

    if (!concept) {
        console.warn('Concept Builder opened without an existing concept.');

        return (
            <ConceptBuilderLayout title="Concept builder">
                <div className="flex min-h-[520px] items-center justify-center text-foreground">
                    <p className="text-sm font-medium text-muted-foreground">
                        No concept selected.
                    </p>
                </div>
            </ConceptBuilderLayout>
        );
    }

    return (
        <ConceptBuilderLayout title={`${concept.title || 'Concept'} builder`}>
            <div className="flex flex-col h-full min-h-0 overflow-hidden border rounded-lg border-border bg-background text-foreground">
                <ConceptTopbar concept={concept} onSave={handleSave} />

                {Object.keys(saveErrors).length > 0 && (
                    <div className="px-6 py-2 text-xs border-b border-error/30 bg-error/10 text-error">
                        <p className="font-semibold">Save failed. Check these fields:</p>
                        <ul className="pl-4 mt-1 list-disc">
                            {Object.entries(saveErrors).map(([field, message]) => (
                                <li key={field}>{field}: {message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    <CourseStructureSidebar
                        concept={concept}
                        topics={topics}
                        activeTopicId={activeTopicId}
                        onSelectTopic={setActiveTopicId}
                        onAddTopic={addTopic}
                        onDeleteTopic={deleteTopic}
                    />

                    <TopicWorkspace
                        concept={concept}
                        topic={activeTopic}
                        quizzes={quizzes}
                        publishableClasses={publishableClasses}
                        onUpdateTopic={(updates) => {
                            if (!activeTopic) return;
                            updateTopic(activeTopic.id, updates);
                        }}
                    />
                </div>
            </div>
        </ConceptBuilderLayout>
    );
}

function ConceptBuilderLayout({ title, children }) {
    return (
        <AppLayout
            contentClassName="my-0 w-full rounded-none shadow-none"
            breadcrumbs={[
                { title: 'Courses', href: coursesIndex() },
                { title: 'Concept builder', href: '#' },
            ]}
        >
            <Head title={title} />
            <div className="h-[calc(100vh-4rem)] min-h-[560px] bg-light p-0 dark:bg-dark">
                {children}
            </div>
        </AppLayout>
    );
}
