import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { UncontrolledButtonDropdown } from 'reactstrap';
import styled from 'styled-components';

import { supportedContentTypes } from '@/components/ContentType/types';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import ROUTES from '@/constants/routes';

const StyledButtonDropdown = styled(UncontrolledButtonDropdown)`
    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
        .dropdown-menu {
            position: relative !important;
            transform: none !important;
            border: 0 !important;
        }
    }
`;

const ContentTypesMenu = ({ closeMenu }) => (
    <StyledButtonDropdown direction="right" className="w-100 nav inNavbar">
        <DropdownToggle tag="button" className="dropdown-item w-100">
            More <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
        </DropdownToggle>
        <DropdownMenu>
            {supportedContentTypes.map(({ id, label }) => (
                <DropdownItem key={id} tag={Link} href={reverse(ROUTES.CONTENT_TYPES, { type: id })} onClick={closeMenu}>
                    {upperFirst(pluralize(label || '', 0, false))}
                </DropdownItem>
            ))}
        </DropdownMenu>
    </StyledButtonDropdown>
);

ContentTypesMenu.propTypes = {
    closeMenu: PropTypes.func.isRequired,
};

export default ContentTypesMenu;
