import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, FileUp, PenLine, Plus, Sparkles } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AiModal from '@/pages/concepts/partials/AiModal';
import ManualModal from '@/pages/concepts/partials/ManualModal';
import PdfModal from '@/pages/concepts/partials/PdfModal';

export default function Quizes({ topicId , conceptId }) {
    console.log({
    topicId,
    conceptId,
});

    const [pdfOpen, setPdfOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [manualOpen, setManualOpen] = useState(false);
    const refreshQuizzes = () => router.reload({ only: ['quizzes'] });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-alpha gap-1.5">
                        <Plus className="size-4" />
                        <TransText en="New Quiz" fr="Nouveau Quiz" ar="اختبار جديد" />
                        <ChevronDown className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-52 bg-light dark:bg-dark_gray dark:border-beta"
                >
                    <DropdownMenuItem
                        className="cursor-pointer gap-2.5 text-beta dark:text-light dark:focus:bg-dark dark:hover:bg-dark"
                        onClick={() => setPdfOpen(true)}
                    >
                        <FileUp className="size-4 text-alpha" />
                        <TransText
                            en="Generate from PDF"
                            fr="Générer par PDF"
                            ar="إنشاء من PDF"
                        />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer gap-2.5 text-beta dark:text-light dark:focus:bg-dark dark:hover:bg-dark"
                        onClick={() => setAiOpen(true)}
                    >
                        <Sparkles className="size-4 text-alpha" />
                        <TransText
                            en="Generate with AI"
                            fr="Générer avec l'IA"
                            ar="إنشاء بالذكاء الاصطناعي"
                        />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer gap-2.5 text-beta dark:text-light dark:focus:bg-dark dark:hover:bg-dark"
                        onClick={() => setManualOpen(true)}
                    >
                        <PenLine className="size-4 text-alpha" />
                        <TransText
                            en="Generate Manually"
                            fr="Créer manuellement"
                            ar="إنشاء يدويًا"
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PdfModal
                open={pdfOpen}
                onOpenChange={setPdfOpen}
                onCreated={refreshQuizzes}
                topicId={topicId}
                conceptId={conceptId}
            />
            <AiModal
                open={aiOpen}
                onOpenChange={setAiOpen}
                onCreated={refreshQuizzes}
                topicId={topicId}
                conceptId={conceptId}
            />
            <ManualModal
                open={manualOpen}
                onOpenChange={setManualOpen}
                onCreated={refreshQuizzes}
                topicId={topicId}
                conceptId={conceptId}
            />
        </>
    );
}
