import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get, groupBy } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import ROUTES from '@/constants/routes';
import { getAboutPageCategories, getAboutPages } from '@/services/cms';
import { AboutPageCategory, HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utils';

const StyledButtonDropdown = styled(UncontrolledButtonDropdown)`
    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
        .dropdown-menu {
            position: relative !important;
            transform: none !important;
            border: 0 !important;
        }
    }
`;

export type Items = {
    [groupId: string | number]: HelpArticle[];
};

type AboutMenuProps = {
    closeMenu: () => void;
};

const AboutMenu: FC<AboutMenuProps> = ({ closeMenu }) => {
    const [items, setItems] = useState<Items | null>({});
    const [categories, setCategories] = useState<AboutPageCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const getItems = async () => {
            setIsLoading(true);
            setItems(groupBy((await getAboutPages())?.data, (item) => get(item, 'attributes.category.data.id', 'main')) ?? {});
            setCategories((await getAboutPageCategories())?.data ?? []);
            setIsLoading(false);
        };
        getItems();
    }, []);

    return (
        <>
            {isLoading && (
                <DropdownItem disabled>
                    <ContentLoader height="80" width="100%" viewBox="0 0 120 50" speed={2}>
                        <rect x="0" y="0" rx="0" ry="0" width="100%" height="20" />
                        <rect x="0" y="30" rx="0" ry="0" width="100%" height="20" />
                    </ContentLoader>
                </DropdownItem>
            )}
            {!isLoading &&
                categories.map((category) => {
                    if (category.attributes.label === 'main') {
                        return items?.main?.map(({ id, attributes: { title } }) => (
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
                    const subItems = items?.[category.id];
                    if (!subItems) {
                        return null;
                    }
                    return (
                        <StyledButtonDropdown key={category.attributes.label} direction="end" className="w-100 nav inNavbar">
                            <DropdownToggle
                                onClick={() => (subItems.length > 0 ? null : closeMenu())}
                                href={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}
                                tag={subItems.length > 0 ? 'button' : Link}
                                className="dropdown-item w-100"
                            >
                                {category.attributes.label}{' '}
                                {subItems.length > 0 && <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />}
                            </DropdownToggle>
                            {subItems.length > 0 && (
                                <DropdownMenu>
                                    {subItems.map(({ id, attributes: { title } }) => (
                                        <DropdownItem
                                            key={id}
                                            tag={Link}
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

export default AboutMenu;
