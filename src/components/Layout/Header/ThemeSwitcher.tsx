'use client';

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import { useTheme } from 'next-themes';

type ThemeSwitcherProps = {
    isTransparentNavbar: boolean;
};

const ThemeSwitcher = ({ isTransparentNavbar }: ThemeSwitcherProps) => {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            variant="secondary"
            isIconOnly
            className={cn(
                isTransparentNavbar && 'border-[#32303b] bg-[#32303b] text-white hover:border-[#100f13] hover:bg-[#100f13] hover:text-white',
            )}
        >
            {/* Render both icons and let the `dark:` variant pick one — keeps server and client markup identical (resolvedTheme is undefined during SSR).
                The spans do the hiding because Font Awesome's unlayered stylesheet overrides Tailwind's layered `hidden` utility on the svg itself. */}
            <span className="inline-flex dark:hidden">
                <FontAwesomeIcon className="size-4" icon={faMoon} />
            </span>
            <span className="hidden dark:inline-flex">
                <FontAwesomeIcon className="size-4" icon={faSun} />
            </span>
        </Button>
    );
};

export default ThemeSwitcher;
