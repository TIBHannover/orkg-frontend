import 'react-contexify/dist/ReactContexify.css';

import { FC } from 'react';
import { Item, Menu } from 'react-contexify';

import { DIAGRAM_CONTEXT_MENU_ID } from '@/constants/misc';

type ContextMenuProps = {
    actions: { label: string; effect: () => void; menu: string[] }[];
    currentMenu: string;
};
const ContextMenu: FC<ContextMenuProps> = ({ actions, currentMenu }) => (
    <Menu id={DIAGRAM_CONTEXT_MENU_ID} animation={undefined}>
        {actions
            .filter((a) => a.menu.includes(currentMenu))
            .map((action) => (
                <Item key={action.label} onClick={action.effect}>
                    {action.label}
                </Item>
            ))}
    </Menu>
);

export default ContextMenu;
