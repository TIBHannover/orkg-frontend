import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { supportedContentTypes } from 'components/ContentType/types';
import ROUTES from 'constants/routes.js';
import { upperFirst } from 'lodash';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import styled from 'styled-components';

const StyledButtonDropdown = styled(UncontrolledButtonDropdown)`
    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        .dropdown-menu {
            position: relative !important;
            transform: none !important;
            border: 0 !important;
        }
    }
`;

const ContentTypesMenu = ({ closeMenu }) => {
    return (
        <StyledButtonDropdown direction="right" className="w-100 nav inNavbar">
            <DropdownToggle tag="button" className="dropdown-item w-100">
                More <Icon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
            </DropdownToggle>
            <DropdownMenu>
                {supportedContentTypes.map(({ id, label }) => (
                    <DropdownItem key={id} tag={RouterNavLink} end to={reverse(ROUTES.CONTENT_TYPES, { type: id })} onClick={closeMenu}>
                        {upperFirst(pluralize(label || '', 0, false))}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </StyledButtonDropdown>
    );
};

ContentTypesMenu.propTypes = {
    closeMenu: PropTypes.func.isRequired
};

export default ContentTypesMenu;
