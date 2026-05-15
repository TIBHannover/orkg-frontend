import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';

type Transparent = boolean;

export const navTriggerClass = (transparent: Transparent, fullWidthMobile?: boolean) =>
    cn(
        'h-10 min-h-10 gap-1 rounded-md px-2 font-normal text-inherit data-[hovered]:bg-default/40 data-[pressed]:bg-default/50',
        fullWidthMobile && 'w-full justify-between md:w-auto md:justify-center',
        transparent ? 'text-white data-[hovered]:text-white data-[hovered]:bg-white/10' : 'text-foreground data-[hovered]:text-foreground',
    );

export const MenuChevron = ({ transparent }: { transparent: boolean }) => (
    <FontAwesomeIcon className={cn('size-3 opacity-80', transparent ? 'text-white' : 'text-muted')} icon={faChevronDown} />
);

export type MenuProps = {
    isTransparentNavbar: boolean;
    fullWidthMobile?: boolean;
};
