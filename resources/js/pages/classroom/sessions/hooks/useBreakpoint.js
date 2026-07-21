import { useEffect, useState } from 'react';
import { classroomBreakpoint } from '../classroomHelpers';

function readBreakpoint() {
    if (typeof window === 'undefined') {
        return classroomBreakpoint.desktop;
    }

    if (window.matchMedia('(min-width: 1280px)').matches) {
        return classroomBreakpoint.desktop;
    }

    if (window.matchMedia('(min-width: 768px)').matches) {
        return classroomBreakpoint.tablet;
    }

    return classroomBreakpoint.mobile;
}

export default function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState(readBreakpoint);

    useEffect(() => {
        const handleResize = () => setBreakpoint(readBreakpoint());

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        breakpoint,
        isDesktop: breakpoint === classroomBreakpoint.desktop,
        isTablet: breakpoint === classroomBreakpoint.tablet,
        isMobile: breakpoint === classroomBreakpoint.mobile,
    };
}
