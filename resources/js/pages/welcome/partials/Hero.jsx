import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, LineChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const easeOut = [0.22, 1, 0.36, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: easeOut },
    },
};

const slideInLeft = {
    hidden: { opacity: 0, x: -32 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.55, ease: easeOut },
    },
};

const slideInRight = {
    hidden: { opacity: 0, x: 32 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.55, ease: easeOut },
    },
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
};

const HERO_BULLETS = [
    { icon: BookOpen, label: 'Courses & modules' },
    { icon: GraduationCap, label: 'Lessons & exercises' },
    { icon: LineChart, label: 'Track your progress' },
];

const HERO_IMAGE_SRC = '/assets/svg/Online%20Learning.svg';

function HeroIllustration() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="relative flex w-full items-center justify-center">
            <motion.div
                className="absolute inset-4 rounded-full bg-alpha/15 blur-3xl dark:bg-alpha/20"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                              scale: [1, 1.08, 1],
                              opacity: [0.5, 0.8, 0.5],
                          }
                }
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.img
                src={HERO_IMAGE_SRC}
                alt="LionsGeek Academy — online learning illustration"
                className="relative z-10 w-full max-w-md object-contain sm:max-w-lg lg:max-w-xl"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeOut }}
            />
        </div>
    );
}

export default function Hero() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <main className="flex min-h-0 flex-1 items-center overflow-hidden">
            <section className="w-full">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-5 px-4 py-3 sm:gap-6 sm:py-4 md:grid-cols-2 md:gap-8 lg:gap-12">
                    <motion.div
                        className="order-2 space-y-4 md:order-1 md:space-y-5"
                        initial={shouldReduceMotion ? false : 'hidden'}
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeUp}>
                            <Badge
                                variant="outline"
                                className="gap-2 rounded-full border-alpha/30 bg-alpha/5 px-3 py-1 text-muted-foreground"
                            >
                                <motion.span
                                    className="inline-block h-2 w-2 rounded-full bg-alpha"
                                    animate={shouldReduceMotion ? undefined : { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                E-Learning Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            className="text-3xl leading-[1.15] font-bold tracking-tight text-beta sm:text-4xl lg:text-5xl dark:text-foreground"
                            variants={slideInLeft}
                        >
                            Learn, build, and grow with{' '}
                            <motion.span
                                className="bg-gradient-to-r from-beta via-beta to-alpha bg-clip-text text-transparent dark:from-foreground dark:via-foreground dark:to-alpha"
                                initial={shouldReduceMotion ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35, duration: 0.5, ease: easeOut }}
                            >
                                LionsGeek Academy
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
                            variants={fadeUp}
                        >
                            Your courses, lessons, and progress — all in one place. Sign in with your LionsGeek account
                            and start learning right away.
                        </motion.p>

                        <motion.div className="flex flex-wrap gap-2" variants={staggerContainer}>
                            {HERO_BULLETS.map(({ icon: Icon, label }) => (
                                <motion.span
                                    key={label}
                                    variants={fadeUp}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/80 backdrop-blur-sm sm:text-sm"
                                >
                                    <Icon className="h-3.5 w-3.5 shrink-0 text-alpha" />
                                    {label}
                                </motion.span>
                            ))}
                        </motion.div>

                        <motion.div className="flex flex-wrap items-center gap-3 pt-1" variants={fadeUp}>
                            <motion.div
                                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                            >
                                <Button asChild size="lg" className="gap-2 bg-alpha px-6 shadow-none">
                                    <a href="/login">
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                </Button>
                            </motion.div>
                            {/* <p className="text-xs text-muted-foreground sm:text-sm">Sign in with your LionsGeek account</p> */}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="order-1 flex max-h-[38vh] items-center justify-center md:order-2 md:max-h-none"
                        initial={shouldReduceMotion ? false : 'hidden'}
                        animate="visible"
                        variants={slideInRight}
                    >
                        <HeroIllustration />
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
