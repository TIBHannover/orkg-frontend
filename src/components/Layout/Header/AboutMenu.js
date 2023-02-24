import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getAboutPagesMenu } from 'services/cms';
import { reverseWithSlug } from 'utils';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { groupBy, get } from 'lodash';
import ContentLoader from 'react-content-loader';
import { faQuestion, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { Steps, Hints } from 'intro.js-react';
import 'intro.js/introjs.css';

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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getItems = async () => {
            setIsLoading(true);
            setItems(groupBy((await getAboutPagesMenu()).data, item => get(item, 'attributes.category.data.attributes.label', 'main')));
            setIsLoading(false);
        };
        getItems();
    }, []);
    // -------------------Tour guide begins for about menu-----------------------------------
    const [enabled, setEnabled] = useState(true);
    const [initialStep, setInitialStep] = useState(0);

    const onExit = () => {
        setEnabled(false);
    };
    const steps = [
        {
            element: '',
            intro: (
                <div>
                    <p>About me go to overview</p>
                </div>
            ),
            position: 'center',
        },
        // {
        //     element: '#entryOptions',
        //     intro: 'The ORKG is a platform for semantic scholarly knowledge. We aim to save researchers from drowning in a flood of publications by making research contributions machine-actionable and providing assistance in finding and comparing relevant literature.',
        // },
        // {
        //     element: '#about',
        //     intro: 'You can use this button to get more information',
        // },
        // {
        //     element: '#contact',
        //     intro: 'You can use this button to contact us',
        // },
        // {
        //     element: '#helpIcon',
        //     intro: 'If you want to start the tour again at a later point, you can do so from this button.',
        // },
    ];
    //------------------------------------------------------
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
                Object.keys(items).map(label => {
                    const subItems = items[label];
                    <Steps enabled={enabled} steps={steps} initialStep={initialStep} onExit={onExit} />;
                    if (label === 'main') {
                        return items.main.map(({ id, title }) => (
                            <DropdownItem
                                key={id}
                                tag={RouterNavLink}
                                exact
                                to={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                                onClick={() => closeMenu()}
                            >
                                {title}
                            </DropdownItem>
                        ));
                    }
                    return (
                        <StyledButtonDropdown key={label} direction="right" className="w-100 nav inNavbar">
                            <DropdownToggle
                                onClick={() => (subItems.length > 0 ? null : closeMenu())}
                                to={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}
                                tag={subItems.length > 0 ? 'button' : RouterNavLink}
                                className="dropdown-item w-100"
                            >
                                {label} {subItems.length > 0 && <Icon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />}
                            </DropdownToggle>

                            {subItems.length > 0 && (
                                <DropdownMenu>
                                    {subItems.map(({ id, attributes: { title } }) => (
                                        <DropdownItem
                                            key={id}
                                            tag={RouterNavLink}
                                            end
                                            to={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
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
