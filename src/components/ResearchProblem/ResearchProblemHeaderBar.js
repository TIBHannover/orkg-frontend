import React, { useState } from 'react';
import { Container, Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import useHeaderBar from './hooks/useHeaderBar';
import { HeaderAnimationContainer, PageHeaderBarContainer } from './styled';
import VisibilitySensor from 'react-visibility-sensor';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';

function ResearchProblemHeaderBar(props) {
    const [showHeaderBar, handleShowHeaderBar] = useHeaderBar(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div>
            {showHeaderBar && (
                <HeaderAnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
                    <PageHeaderBarContainer>
                        <Container className="d-flex align-items-center py-2">
                            <div className="title">{props.title}</div>
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                color="darkblue"
                                className="float-right"
                                onClick={() => props.toggleEdit()}
                            >
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                        </Container>
                    </PageHeaderBarContainer>
                </HeaderAnimationContainer>
            )}
            <VisibilitySensor onChange={handleShowHeaderBar}>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Research problem</h1>
                    <ButtonGroup>
                        <RequireAuthentication
                            component={Button}
                            size="sm"
                            color="darkblue"
                            className="float-right"
                            onClick={() => props.toggleEdit()}
                        >
                            <Icon icon={faPen} /> Edit
                        </RequireAuthentication>
                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                            <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: props.id })}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </ButtonGroup>
                </Container>
            </VisibilitySensor>
        </div>
    );
}

ResearchProblemHeaderBar.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    toggleEdit: PropTypes.func.isRequired
};

export default ResearchProblemHeaderBar;
