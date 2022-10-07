import { useState } from 'react';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faSpinner, faPen } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import useResourceDescription from './hooks/useResourceDescription';

const ResourceHeader = ({ id }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const { resource, isLoading, isFailedLoading, loadResourceData } = useResourceDescription({
        id,
    });

    return (
        <>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <NotFound />}
            {!isLoading && resource && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    className="float-end"
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={NavLink} end to={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                        titleAddition={`Referred in ${resource.shared} paper`}
                    >
                        {resource.label}
                    </TitleBar>

                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={resource.id}
                            label={resource.label}
                            enableEdit={true}
                            syncBackend={true}
                            onCloseModal={() => loadResourceData()}
                        />
                    )}
                </>
            )}
        </>
    );
};

ResourceHeader.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ResourceHeader;
