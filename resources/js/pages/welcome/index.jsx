import { Head } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Hero from './partials/Hero';

export default function Welcome() {
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex h-dvh flex-col overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                    <div className="absolute inset-0 bg-gradient-to-br from-alpha/8 via-background to-muted/30 dark:from-alpha/5 dark:via-background dark:to-background" />
                    <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-alpha/10 blur-3xl dark:bg-alpha/15" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-alpha/5 blur-3xl dark:bg-alpha/10" />
                    {!shouldReduceMotion && (
                        <motion.div
                            className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-alpha/10 blur-3xl dark:bg-alpha/20"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    )}
                </div>

                <Navbar />
                <Hero />
                <Footer />
            </div>
        </>
    );
}
