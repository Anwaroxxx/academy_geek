import { motion } from 'framer-motion';

const LOGO_SRC = '/assets/images/logolionsgeek.png';

const SOCIAL_LINKS = [
    { name: 'Instagram', href: 'https://www.instagram.com/lions_geek/' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/lionsgeek/posts/?feedView=all' },
    { name: 'YouTube', href: 'https://www.youtube.com/@lionsgeek_MA' },
];

export default function Footer() {
    return (
        <footer className="shrink-0 border-t border-border/60 bg-background/80 py-3 backdrop-blur-md sm:py-4">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:gap-4">
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <img src={LOGO_SRC} alt="LionsGeek" className="h-6 w-6 object-contain dark:brightness-110" />
                    <span className="text-sm font-medium text-beta dark:text-foreground">LionsGeek Academy</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        © {new Date().getFullYear()} LionsGeek
                    </span>
                </motion.div>

                <motion.div
                    className="flex gap-4 sm:gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    {SOCIAL_LINKS.map((link) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-alpha sm:text-sm"
                            whileHover={{ y: -1 }}
                        >
                            {link.name}
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </footer>
    );
}
