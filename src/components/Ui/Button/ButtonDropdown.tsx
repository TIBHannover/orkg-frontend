import { Dropdown } from '@heroui/react';
import { type FC, type ReactNode } from 'react';

type ButtonDropdownProps = {
    isOpen?: boolean;
    toggle?: () => void;
    children?: ReactNode;
    className?: string;
    id?: string;
};

const ButtonDropdown: FC<ButtonDropdownProps> = ({ isOpen, toggle, children, className }) => {
    return (
        <Dropdown isOpen={isOpen} onOpenChange={() => toggle?.()} className={className}>
            {children}
        </Dropdown>
    );
};

export default ButtonDropdown;
