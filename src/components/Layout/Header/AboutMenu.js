import Link from 'components/NextJsMigration/Link';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getAboutPageCategories, getAboutPages } from 'services/cms';
import { reverseWithSlug } from 'utils';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { groupBy, get } from 'lodash';
import ContentLoader from 'react-content-loader';
import usePathname from 'components/NextJsMigration/usePathname';

const StyledButtonDropdown = styled(UncontrolledButtonDropdown)`
    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        .dropdown-menu {
            position: relative !important;
            transform: none !important;
            border: 0 !important;
        }
    }
`;

const AboutMenu = ({ closeMenu }) => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const getItems = async () => {
            setIsLoading(true);
            setItems(groupBy((await getAboutPages()).data, item => get(item, 'attributes.category.data.id', 'main')) ?? []);
            setCategories((await getAboutPageCategories()).data ?? []);
            setIsLoading(false);
        };
        getItems();
    }, []);
    return (
        <>
            {isLoading && (
                <DropdownItem disabled>
                    <ContentLoader height="80" width="100%" viewBox="0 0 120 50" speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
                        <rect x="0" y="0" rx="0" ry="0" width="100%" height="20" />
                        <rect x="0" y="30" rx="0" ry="0" width="100%" height="20" />
                    </ContentLoader>
                </DropdownItem>
            )}
            {!isLoading &&
                categories.map(category => {
                    const subItems = items[category.id];
                    if (category.attributes.label === 'main') {
                        return items.main.map(({ id, title }) => (
                            <DropdownItem
                                key={id}
                                tag={Link}
                                exact
                                href={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                                onClick={() => closeMenu()}
                                active={pathname === reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                            >
                                {title}
                            </DropdownItem>
                        ));
                    }
                    return (
                        <StyledButtonDropdown key={category.attributes.label} direction="right" className="w-100 nav inNavbar">
                            <DropdownToggle
                                onClick={() => (subItems.length > 0 ? null : closeMenu())}
                                href={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}
                                tag={subItems.length > 0 ? 'button' : Link}
                                className="dropdown-item w-100"
                            >
                                {category.attributes.label}{' '}
                                {subItems.length > 0 && <Icon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />}
                            </DropdownToggle>
                            {subItems.length > 0 && (
                                <DropdownMenu>
                                    {subItems.map(({ id, attributes: { title } }) => (
                                        <DropdownItem
                                            key={id}
                                            tag={Link}
                                            end
                                            href={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                                            active={pathname === reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                                            onClick={() => closeMenu()}
                                        >
                                            {title}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            )}
                        </StyledButtonDropdown>
                    );
                })}
        </>
    );
};

AboutMenu.propTypes = {
    closeMenu: PropTypes.func.isRequired,
};

export default AboutMenu;
