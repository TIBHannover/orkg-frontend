import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { useSelector } from 'react-redux';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import DATA_TYPES from 'constants/DataTypes';
import { Button, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { ValueItemStyle, PulsateIcon } from 'components/StatementBrowser/styled';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { Link } from 'react-router-dom';
import { getResourceLink, reverseWithSlug } from 'utils';
import capitalize from 'capitalize';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import ValueItemOptions from './ValueItemOptions/ValueItemOptions';
import useValueItem from './hooks/useValueItem';

const cookies = new Cookies();

const ValueItem = props => {
    const {
        resource,
        value,
        modal,
        setModal,
        dialogResourceId,
        dialogResourceLabel,
        openExistingResourcesInDialog,
        handleExistingResourceClick,
        handleResourceClick,
        formattedLabel,
    } = useValueItem({ valueId: props.id, propertyId: props.propertyId, syncBackend: props.syncBackend, contextStyle: props.contextStyle });

    const resourcesAsLinks = useSelector(state => state.statementBrowser.resourcesAsLinks);
    const preferences = useSelector(state => state.statementBrowser.preferences);
    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (value._class !== ENTITIES.LITERAL && (existingResourceId || props.contextStyle !== 'StatementBrowser') && openExistingResourcesInDialog) {
        handleOnClick = handleExistingResourceClick;
    } else if (value._class !== ENTITIES.LITERAL) {
        handleOnClick = handleResourceClick;
    }

    return (
        <>
            <ValueItemStyle>
                {!value.isEditing || !props.enableEdit ? (
                    <div>
                        {!value.isSaving && (
                            <DescriptionTooltip
                                disabled={
                                    !preferences.showValueInfo || (!value.id && !value.classes?.length) || value?.classes?.includes(CLASSES.PROBLEM)
                                }
                                id={value?.id}
                                _class={value._class}
                                classes={value.classes}
                            >
                                <span tabIndex="0">
                                    {resource && !resource.isFetching && value._class !== ENTITIES.LITERAL && !resourcesAsLinks && (
                                        <>
                                            {!props.enableEdit && resource?.classes?.includes(CLASSES.PROBLEM) ? (
                                                <Link
                                                    to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                        researchProblemId: existingResourceId,
                                                        slug: resource.label,
                                                    })}
                                                    target="_blank"
                                                >
                                                    {resource.label} <Icon icon={faExternalLinkAlt} />
                                                </Link>
                                            ) : (
                                                <Button
                                                    className="p-0 text-start objectLabel"
                                                    color="link"
                                                    onClick={() => {
                                                        cookies.set('showedValueHelp', true, { path: env('PUBLIC_URL'), maxAge: 604800 });
                                                        handleOnClick();
                                                    }}
                                                    style={{ userSelect: 'text' }}
                                                >
                                                    {value._class === ENTITIES.CLASS && <div className="typeCircle">C</div>}
                                                    {value._class === ENTITIES.PREDICATE && <div className="typeCircle">P</div>}
                                                    {props.showHelp && value._class === ENTITIES.RESOURCE ? (
                                                        <span style={{ position: 'relative' }}>
                                                            <PulsateIcon />
                                                            <ValuePlugins type="resource">
                                                                {formattedLabel !== '' ? formattedLabel.toString() : <i>No label</i>}
                                                            </ValuePlugins>
                                                        </span>
                                                    ) : (
                                                        <ValuePlugins type="resource">
                                                            {formattedLabel !== '' ? formattedLabel.toString() : <i>No label</i>}
                                                        </ValuePlugins>
                                                    )}
                                                    {resource && resource.existingResourceId && openExistingResourcesInDialog && (
                                                        <span>
                                                            {' '}
                                                            <Icon icon={faExternalLinkAlt} />
                                                        </span>
                                                    )}
                                                </Button>
                                            )}
                                        </>
                                    )}

                                    {resource && value._class !== ENTITIES.LITERAL && resourcesAsLinks && (
                                        <Link className="objectLabel" to={getResourceLink(value._class, value.resourceId)}>
                                            {value._class === ENTITIES.CLASS && <div className="typeCircle">C</div>}
                                            {value._class === ENTITIES.PREDICATE && <div className="typeCircle">P</div>}
                                            {value.label || <i>No label</i>}
                                        </Link>
                                    )}

                                    {resource && resource.isFetching && value._class === ENTITIES.RESOURCE && 'Loading...'}

                                    {value._class === ENTITIES.LITERAL && (
                                        <div className="literalLabel">
                                            <ValuePlugins type={ENTITIES.LITERAL}>
                                                {value.label !== '' ? value.label.toString() : <i>No label</i>}
                                            </ValuePlugins>
                                            {preferences.showLiteralDataTypes && (
                                                <small>
                                                    <Badge color="light" className="ms-2" title={value.datatype}>
                                                        {DATA_TYPES.find(dt => dt.type === value.datatype)?.name ?? value.datatype}
                                                    </Badge>
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </span>
                            </DescriptionTooltip>
                        )}
                        {value.isSaving && 'Saving...'}
                        <ValueItemOptions id={props.id} enableEdit={props.enableEdit} syncBackend={props.syncBackend} handleOnClick={handleOnClick} />
                    </div>
                ) : (
                    <ValueForm id={props.id} syncBackend={props.syncBackend} />
                )}
            </ValueItemStyle>

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={Boolean(props.contextStyle === 'StatementBrowser' || existingResourceId)}
                    enableEdit={props.enableEdit && props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                />
            ) : (
                ''
            )}
        </>
    );
};

ValueItem.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool,
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false,
};

export default ValueItem;
