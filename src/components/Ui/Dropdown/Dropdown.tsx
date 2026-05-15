import { Dropdown as HeroUIDropdown } from '@heroui/react';
import { type FC, type ReactNode } from 'react';

type DropdownProps = {
    isOpen?: boolean;
    toggle?: () => void;
    children?: ReactNode;
    className?: string;
    direction?: string;
    group?: boolean;
    tag?: string;
};

const Dropdown: FC<DropdownProps> = ({ isOpen, toggle, children, direction: _direction, group: _group, tag: _tag, ...rest }) => {
    return (
        <HeroUIDropdown isOpen={isOpen} onOpenChange={() => toggle?.()} {...rest}>
            {children}
        </HeroUIDropdown>
    );
};

export default Dropdown;
