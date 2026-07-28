import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { generate as aiGenerate } from '@/routes/quizes/ai';

const INITIAL_MESSAGES = [
    {
        role: 'assistant',
        text: "Hello! Tell me the topic you want a quiz about, or describe the content and I'll generate questions for you.",
    },
];

export default function AiModal({ open, onOpenChange, onCreated, topicId, conceptId }) {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) {
            setMessages(INITIAL_MESSAGES);
            setInput('');
            setError('');
            setChatLoading(false);
            setGenerating(false);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    const sendMessage = () => {
        const text = input.trim();
        if (!text || chatLoading) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setError('');
        setChatLoading(true);

        // TODO: replace with real AI chat API call
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: 'Got it! I\'ll build a quiz around that. Feel free to add more details, or click "Generate Quiz" when you\'re ready.',
                },
            ]);
            setChatLoading(false);
        }, 1600);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleGenerate = () => {
        const topic = messages
            .filter((message) => message.role === 'user')
            .map((message) => message.text)
            .join('\n')
            .trim();

        if (!topic) {
            setError('Please describe a topic before generating the quiz.');
            return;
        }

        if (!topicId && !conceptId) {
            setError('Please select a lesson or concept before generating the quiz.');
            return;
        }
        setGenerating(true);
        setError('');

        router.post(
            aiGenerate.url(),
            {
                topic_id: topicId || null ,
                concept_id: conceptId || null ,
                topic,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onCreated?.();
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setError(
                        errors.topic_id ?? errors.concept_id ?? errors.topic ?? 'Unable to generate quiz with AI.',
                    );
                },
                onFinish: () => setGenerating(false),
            },
        );
    };

    const hasConversation = messages.length > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
                {/* ── Header ── */}
                <DialogHeader className="border-b border-beta/10 px-6 py-5 dark:border-beta">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-alpha/10 text-alpha">
                            <Sparkles className="size-4" />
                        </span>
                        <div>
                            <DialogTitle>
                                <TransText
                                    en="Generate Quiz with AI"
                                    fr="Générer un Quiz avec l'IA"
                                    ar="إنشاء اختبار بالذكاء الاصطناعي"
                                />
                            </DialogTitle>
                            <p className="mt-0.5 text-xs text-beta/50 dark:text-light/50">
                                <TransText
                                    en="Describe your topic and let AI build the quiz."
                                    fr="Décrivez votre sujet et laissez l'IA créer le quiz."
                                    ar="صف موضوعك ودع الذكاء الاصطناعي يبني الاختبار."
                                />
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── Chat messages ── */}
                <div className="custom-scrollbar flex min-h-[280px] flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <span
                                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                    msg.role === 'user'
                                        ? 'bg-beta text-light dark:bg-dark_gray dark:text-alpha'
                                        : 'bg-alpha/15 text-beta dark:text-alpha'
                                }`}
                            >
                                {msg.role === 'user' ? (
                                    <User className="size-4" />
                                ) : (
                                    <Bot className="size-4" />
                                )}
                            </span>

                            {/* Bubble */}
                            <div
                                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'rounded-tr-sm bg-beta text-light dark:bg-dark_gray dark:text-light'
                                        : 'rounded-tl-sm border border-alpha/20 bg-alpha/8 text-beta dark:border-alpha/10 dark:bg-dark dark:text-light'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {chatLoading && (
                        <div className="flex gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-alpha/15 text-alpha">
                                <Bot className="size-4" />
                            </span>
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-alpha/20 bg-alpha/8 px-4 py-3 dark:border-alpha/10 dark:bg-dark">
                                <span className="size-2 animate-bounce rounded-full bg-alpha/60 [animation-delay:0ms]" />
                                <span className="size-2 animate-bounce rounded-full bg-alpha/60 [animation-delay:150ms]" />
                                <span className="size-2 animate-bounce rounded-full bg-alpha/60 [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* ── Input area ── */}
                <div className="border-t border-beta/10 px-6 py-3 dark:border-beta">
                    <div className="flex items-end gap-2">
                        <textarea
                            rows={2}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={chatLoading || generating}
                            placeholder="Describe the topic or content for the quiz…"
                            className="custom-scrollbar flex-1 resize-none rounded-lg border border-beta/20 bg-transparent px-3 py-2 text-sm text-beta placeholder:text-beta/40 focus:border-alpha/50 focus:ring-2 focus:ring-alpha/15 focus:outline-none disabled:opacity-50 dark:border-beta dark:text-light dark:placeholder:text-light/30 dark:focus:border-alpha/60"
                        />
                        <Button
                            type="button"
                            size="icon"
                            disabled={
                                !input.trim() || chatLoading || generating
                            }
                            onClick={sendMessage}
                            className="mb-0.5 shrink-0 bg-alpha text-beta hover:bg-alpha/85 disabled:opacity-50"
                        >
                            <Send className="size-4" />
                        </Button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-beta/35 dark:text-light/25">
                        <TransText
                            en="Press Enter to send · Shift+Enter for new line"
                            fr="Entrée pour envoyer · Maj+Entrée pour nouvelle ligne"
                            ar="Enter للإرسال · Shift+Enter لسطر جديد"
                        />
                    </p>
                </div>

                {/* ── Footer ── */}
                <DialogFooter className="border-t border-beta/10 px-6 py-4 dark:border-beta">
                    {error && (
                        <p className="mr-auto text-xs text-error">{error}</p>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        className="border-beta/20 text-beta/70 dark:border-light/20 dark:text-light/70"
                        onClick={() => onOpenChange(false)}
                        disabled={generating}
                    >
                        <TransText en="Cancel" fr="Annuler" ar="إلغاء" />
                    </Button>
                    <Button
                        type="button"
                        disabled={generating || !hasConversation}
                        onClick={handleGenerate}
                        className="gap-1.5 bg-alpha font-semibold hover:bg-alpha/85 disabled:opacity-60"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <TransText
                                    en="Processing…"
                                    fr="Traitement…"
                                    ar="جارٍ المعالجة…"
                                />
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-4" />
                                <TransText
                                    en="Generate Quiz"
                                    fr="Générer le Quiz"
                                    ar="إنشاء الاختبار"
                                />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
