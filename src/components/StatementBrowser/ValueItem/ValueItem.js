import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { useSelector } from 'react-redux';
import { Fragment } from 'react';
import useValueItem from './hooks/useValueItem';
import PropTypes from 'prop-types';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import DATA_TYPES from 'constants/DataTypes';
import { Button, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { Link } from 'react-router-dom';
import { getResourceLink } from 'utils';
import capitalize from 'capitalize';
import Tippy from '@tippyjs/react';
import { reverseWithSlug } from 'utils';
import ROUTES from 'constants/routes';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ValueItemOptions from './ValueItemOptions/ValueItemOptions';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';

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
        getLabel
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
                {!value.isEditing ? (
                    <div>
                        {!value.isSaving && (
                            <Tippy
                                disabled={!preferences['showValueInfo'] || (!value.id && !value.classes?.length)}
                                delay={[500, 0]}
                                interactive={true}
                                content={
                                    <div className="p-1">
                                        <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                                            {value.id && (
                                                <li className="mb-1">
                                                    {capitalize(value._class)} id: {value.id}
                                                </li>
                                            )}
                                            {value.classes?.length > 0 && (
                                                <li className="mb-1">
                                                    Instance of:{' '}
                                                    {value.classes.map((c, index) => (
                                                        <Fragment key={index}>
                                                            <Link to={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                                                {c}
                                                            </Link>
                                                            {index + 1 < value.classes.length && ','}
                                                        </Fragment>
                                                    ))}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                }
                            >
                                <span tabIndex="0">
                                    {resource && !resource.isFetching && value._class !== ENTITIES.LITERAL && !resourcesAsLinks && (
                                        <>
                                            {!props.enableEdit && resource?.classes?.includes(CLASSES.PROBLEM) ? (
                                                <Link
                                                    to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                        researchProblemId: existingResourceId,
                                                        slug: resource.label
                                                    })}
                                                >
                                                    <DescriptionTooltip id={existingResourceId} typeId={CLASSES.PROBLEM}>
                                                        {resource.label}
                                                    </DescriptionTooltip>
                                                </Link>
                                            ) : (
                                                <Button
                                                    className="p-0 text-left objectLabel"
                                                    color="link"
                                                    onClick={handleOnClick}
                                                    style={{ userSelect: 'text' }}
                                                >
                                                    {value._class === ENTITIES.CLASS && <div className="typeCircle">C</div>}
                                                    {value._class === ENTITIES.PREDICATE && <div className="typeCircle">P</div>}
                                                    {props.showHelp && value._class === ENTITIES.RESOURCE ? (
                                                        <Pulse content="Click on the resource to browse it">
                                                            <ValuePlugins type="resource">
                                                                {getLabel() !== '' ? getLabel().toString() : <i>No label</i>}
                                                            </ValuePlugins>
                                                        </Pulse>
                                                    ) : (
                                                        <ValuePlugins type="resource">
                                                            {getLabel() !== '' ? getLabel().toString() : <i>No label</i>}
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
                                            {preferences['showLiteralDataTypes'] && (
                                                <small>
                                                    <Badge color="light" className="ml-2" title={value.datatype}>
                                                        {DATA_TYPES.find(dt => dt.type === value.datatype)?.name ?? value.datatype}
                                                    </Badge>
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </span>
                            </Tippy>
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
    showHelp: PropTypes.bool
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false
};

export default ValueItem;
