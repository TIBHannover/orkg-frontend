'use client';

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'orkg-theme';

const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'light';
};

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
};

type ThemeSwitcherProps = {
    isTransparentNavbar: boolean;
};

const ThemeSwitcher = ({ isTransparentNavbar }: ThemeSwitcherProps) => {
    const [theme, setTheme] = useState<Theme>(getStoredTheme);

    // Apply theme to DOM — this is syncing React state to an external system (the DOM),
    // which is the intended use case for useEffect.
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next: Theme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    return (
        <Button
            onClick={toggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            variant="secondary"
            isIconOnly
            className={cn(
                isTransparentNavbar && 'border-[#32303b] bg-[#32303b] text-white hover:border-[#100f13] hover:bg-[#100f13] hover:text-white',
            )}
        >
            <FontAwesomeIcon className="size-4" icon={theme === 'light' ? faMoon : faSun} />
        </Button>
    );
};

export default ThemeSwitcher;
