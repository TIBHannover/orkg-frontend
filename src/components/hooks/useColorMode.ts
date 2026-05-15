'use client';

import { useEffect, useState } from 'react';

type ColorMode = 'light' | 'dark';

const read = (): ColorMode => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');

const useColorMode = (): ColorMode => {
    const [mode, setMode] = useState<ColorMode>(read);

    useEffect(() => {
        const update = () => setMode(read());
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return mode;
};

export default useColorMode;
