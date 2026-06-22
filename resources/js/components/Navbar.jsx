import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

const LOGO_SRC = '/assets/images/logolionsgeek.png';
const easeOut = [0.22, 1, 0.36, 1];

export default function Navbar() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const shouldReduceMotion = useReducedMotion();

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <motion.header
            className="shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md"
            initial={shouldReduceMotion ? false : { y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: easeOut }}
        >
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16">
                <div className="flex items-center gap-2.5">
                    <img src={LOGO_SRC} alt="LionsGeek Academy" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
                    <div className="flex flex-col leading-none">
                        <span className="text-base font-semibold text-beta sm:text-lg dark:text-foreground">Academy</span>
                        <span className="text-[10px] text-muted-foreground sm:text-xs">by LionsGeek</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full border-border hover:border-alpha"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="h-4 w-4 text-alpha" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    </Button>

                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.35, ease: easeOut }}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    >
                        <Button asChild size="sm" className="rounded-lg bg-alpha border-transparent shadow-none sm:h-9 sm:px-5">
                            <a href="/login">Log in</a>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.header>
    );
}
