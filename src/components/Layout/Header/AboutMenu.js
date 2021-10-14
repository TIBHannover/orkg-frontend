import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getAboutPages } from 'services/cms';
import { reverseWithSlug } from 'utils';

const AboutMenu = ({ closeMenu }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const getItems = async () => {
            setItems(await getAboutPages());
        };
        getItems();
    }, []);

    return (
        <UncontrolledButtonDropdown direction="right" className="w-100">
            <DropdownToggle tag="button" className="dropdown-item w-100 pr-3">
                About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
            </DropdownToggle>
            <DropdownMenu>
                {items.map(({ id, title }) => (
                    <DropdownItem tag={RouterNavLink} exact to={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })} onClick={() => closeMenu()}>
                        {title}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    );
};

AboutMenu.propTypes = {
    closeMenu: PropTypes.func.isRequired
};

export default AboutMenu;
