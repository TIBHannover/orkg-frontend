import { faQuestionCircle, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Breadcrumbs from 'components/DataBrowser/components/Header/Breadcrumbs/Breadcrumbs';
import Metadata from 'components/DataBrowser/components/Header/Metadata/Metadata';
import Preferences from 'components/DataBrowser/components/Header/Preferences/Preferences';
import NotFound from 'components/DataBrowser/components/NotFound/NotFound';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useSnapshotStatement from 'components/DataBrowser/hooks/useSnapshotStatement';
import Popover from 'components/FloatingUI/Popover';
import Tooltip from 'components/FloatingUI/Tooltip';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Alert, Button, ButtonGroup, UncontrolledAlert } from 'reactstrap';

const Header = () => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { config } = useDataBrowserState();
    const { error } = useEntity();
    const { isEditMode } = config;
    const dispatch = useDataBrowserDispatch();
    const { canEdit } = useCanEdit();

    const [preferencesPopover, setPreferencesPopover] = useState(false);

    if (error && error.statusCode === 404) {
        return <NotFound />;
    }
    if (error) {
        throw error;
    }

    return (
        <div>
            {isUsingSnapshot && (
                <Alert color="info" className="mb-0 p-2 rounded-0">
                    <p className="mb-0">
                        You are viewing a version of the data. This version was created on{' '}
                        {dayjs(config.statementsSnapshot?.[0].created_at)?.format('DD MMMM YYYY - H:mm:ss')}
                    </p>
                </Alert>
            )}
            <div className="d-flex br-bottom p-2 align-items-center">
                <Breadcrumbs />
                <ButtonGroup className="m-auto flex-shrink-0" size="sm">
                    <Popover
                        open={preferencesPopover}
                        onOpenChange={setPreferencesPopover}
                        content={<Preferences closeTippy={() => setPreferencesPopover(false)} />}
                    >
                        <div
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            onClick={() => setPreferencesPopover((v) => !v)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.code === 'Enter' ? setPreferencesPopover((v) => !v) : undefined)}
                        >
                            <div className="flex-grow-1">
                                <FontAwesomeIcon fixedWidth icon={faSlidersH} />
                            </div>
                        </div>
                    </Popover>
                    <Button outline size="sm" onClick={() => dispatch({ type: 'SET_IS_HELP_MODAL_OPEN', payload: { isOpen: true } })}>
                        <FontAwesomeIcon fixedWidth icon={faQuestionCircle} />
                    </Button>
                </ButtonGroup>
            </div>
            {!canEdit && isEditMode && (
                <UncontrolledAlert color="info" className="mb-0 mt-2 mx-2">
                    A shared resource cannot be edited directly{' '}
                    <Tooltip content="Open help center">
                        <span className="ms-2">
                            <a
                                href="https://orkg.org/help-center/article/29/%22A_shared_resource_cannot_be_edited_directly%22_-_What_does_that_mean"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FontAwesomeIcon
                                    icon={faQuestionCircle}
                                    style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }}
                                    className="text-secondary p-0"
                                />
                            </a>
                        </span>
                    </Tooltip>
                </UncontrolledAlert>
            )}
            <Metadata />
        </div>
    );
};

export default Header;
