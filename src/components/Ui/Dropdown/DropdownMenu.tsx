import { Dropdown } from '@heroui/react';
import { type CSSProperties, forwardRef, type ReactNode } from 'react';

type DropdownMenuProps = {
    children?: ReactNode;
    end?: boolean | string;
    className?: string;
    style?: CSSProperties;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownMenu = forwardRef<any, DropdownMenuProps & Record<string, any>>(({ children, end, ...rest }, ref) => {
    const isEnd = end === 'true' || end === true;

    return (
        <Dropdown.Popover isNonModal ref={ref} placement={isEnd ? 'bottom end' : 'bottom'} {...rest}>
            <Dropdown.Menu>{children}</Dropdown.Menu>
        </Dropdown.Popover>
    );
});

DropdownMenu.displayName = 'DropdownMenu';

export default DropdownMenu;
