import { Eye, Save, HelpCircle, Award } from 'lucide-react';
import Quizes from '@/components/quizes';
import Exercises from '@/components/exercices';

export default function ConceptTopbar({ concept, onSave }) {
    return (
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
            <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Concept Builder
                </p>
                <h1 className="text-sm font-semibold text-card-foreground">
                    {concept?.title || 'Untitled Concept'}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 mr-2">
                        <Quizes conceptId={concept?.id} />
                        <Exercises coachType="coding" conceptId={concept?.id} />

                </div>



                <button
                    type="button"
                    onClick={onSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-alpha text-xs font-semibold"
                >
                    <Save className="w-4 h-4" />
                    Save
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition">
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
            </div>
        </header>
    );
}
