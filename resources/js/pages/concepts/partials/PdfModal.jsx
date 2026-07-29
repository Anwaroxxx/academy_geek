import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { generate as fileGenerate } from '@/routes/quizes/file';

const MAX_SIZE_MB = 10;

export default function PdfModal({
    open,
    onOpenChange,
    onCreated,
    topicId,
    conceptId,
}) {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const inputRef = useRef(null);

    const reset = () => {
        setFile(null);
        setError('');
        setProcessing(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
    };

    const validateAndSet = (picked) => {
        if (!picked) return;
        setError('');

        if (
            picked.type !== 'application/pdf' ||
            !picked.name.toLowerCase().endsWith('.pdf')
        ) {
            setFile(null);
            setError('Only PDF files are accepted.');
            return;
        }
        if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
            setFile(null);
            setError(`File size must not exceed ${MAX_SIZE_MB} MB.`);
            return;
        }
        setFile(picked);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        validateAndSet(e.dataTransfer.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF before generating the quiz.');
            return;
        }
        if (!topicId && !conceptId) {
            setError(
                'Please select a lesson or concept before generating the quiz.',
            );
            return;
        }
        setProcessing(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        if (topicId) formData.append('topic_id', topicId);
        if (conceptId) formData.append('concept_id', conceptId);

        router.post(fileGenerate.url(), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onCreated?.();
                handleOpenChange(false);
            },
            onError: (errors) => {
                setError(
                    errors.file ??
                        errors.topic_id ??
                        errors.concept_id ??
                        'Unable to generate a quiz from this PDF.',
                );
            },
            onFinish: () => setProcessing(false),
        });
    };

    const fileExt = file ? file.name.split('.').pop().toUpperCase() : '';
    const fileSizeKb = file ? (file.size / 1024).toFixed(1) : '';

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        <TransText
                            en="Generate Quiz from PDF"
                            fr="Générer un Quiz depuis un PDF"
                            ar="إنشاء اختبار من ملف PDF"
                        />
                    </DialogTitle>
                    <DialogDescription>
                        <TransText
                            en="Upload a PDF and we'll generate questions from its readable text."
                            fr="Téléchargez un PDF et nous générerons des questions à partir de son texte lisible."
                            ar="حمّل ملف PDF وسننشئ أسئلة من النص القابل للقراءة فيه."
                        />
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="pdf-quiz-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !file && inputRef.current?.click()}
                        className={[
                            'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors',
                            file ? 'cursor-default' : 'cursor-pointer',
                            dragging
                                ? 'border-alpha bg-alpha/10'
                                : file
                                  ? 'border-good/40 bg-good/5 dark:border-good/30 dark:bg-good/5'
                                  : 'border-beta/20 hover:border-alpha/50 hover:bg-alpha/5 dark:border-beta dark:hover:border-alpha/40 dark:hover:bg-alpha/5',
                        ].join(' ')}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="sr-only"
                            onChange={(e) =>
                                validateAndSet(e.target.files?.[0])
                            }
                        />

                        {file ? (
                            <div className="flex w-full items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-alpha/15 text-beta dark:text-alpha">
                                    <FileText className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-beta dark:text-light">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-beta/50 dark:text-light/50">
                                        {fileExt} · {fileSizeKb} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        reset();
                                    }}
                                    className="shrink-0 rounded-md p-1 text-beta/40 transition-colors hover:text-error dark:text-light/40 dark:hover:text-error"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="flex size-12 items-center justify-center rounded-xl bg-alpha/10 text-alpha">
                                    <Upload className="size-6" />
                                </span>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-beta dark:text-light">
                                        <TransText
                                            en="Click or drag & drop your file here"
                                            fr="Cliquez ou glissez-déposez votre fichier ici"
                                            ar="انقر أو اسحب وأفلت ملفك هنا"
                                        />
                                    </p>
                                    <p className="mt-1 text-xs text-beta/50 dark:text-light/50">
                                        PDF — max {MAX_SIZE_MB} MB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {error && <p className="text-xs text-error">{error}</p>}
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-beta/20 text-beta/70 dark:border-light/20 dark:text-light/70"
                        onClick={() => handleOpenChange(false)}
                        disabled={processing}
                    >
                        <TransText en="Cancel" fr="Annuler" ar="إلغاء" />
                    </Button>
                    <Button
                        type="submit"
                        form="pdf-quiz-form"
                        disabled={processing || !file}
                        className="gap-1.5 bg-alpha font-semibold hover:bg-alpha/85 disabled:opacity-60"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <TransText
                                    en="Processing…"
                                    fr="Traitement…"
                                    ar="جارٍ المعالجة…"
                                />
                            </>
                        ) : (
                            <TransText
                                en="Generate Quiz"
                                fr="Générer le Quiz"
                                ar="إنشاء الاختبار"
                            />
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
