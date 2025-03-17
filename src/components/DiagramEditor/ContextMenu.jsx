import PropTypes from 'prop-types';
import { Menu, Item } from 'react-contexify';
import { DIAGRAM_CONTEXT_MENU_ID } from 'constants/misc';
import 'react-contexify/dist/ReactContexify.css';

const ContextMenu = ({ actions, currentMenu }) => (
    <Menu id={DIAGRAM_CONTEXT_MENU_ID} animation={null}>
        {actions
            .filter((a) => a.menu.includes(currentMenu))
            .map((action) => (
                <Item key={action.label} onClick={action.effect}>
                    {action.label}
                </Item>
            ))}
    </Menu>
);

ContextMenu.propTypes = { actions: PropTypes.array, currentMenu: PropTypes.string };

export default ContextMenu;
