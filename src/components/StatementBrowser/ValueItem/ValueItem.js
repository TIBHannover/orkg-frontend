import Link from 'components/NextJsMigration/Link';
import env from 'components/NextJsMigration/env';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Cookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getResourceLink, reverseWithSlug } from 'utils';
import useValueItem from 'components/StatementBrowser/ValueItem/hooks/useValueItem';
import ValueDatatype from 'components/StatementBrowser/ValueItem/ValueDatatype/ValueDatatype';
import ValueItemOptions from 'components/StatementBrowser/ValueItem/ValueItemOptions/ValueItemOptions';

const cookies = new Cookies();

const ValueItem = ({
    contextStyle = 'StatementBrowser',
    showHelp = false,
    shouldDisableValueItemStyle = false,
    propertyId,
    syncBackend,
    id,
    enableEdit,
}) => {
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
    } = useValueItem({ valueId: id, propertyId, syncBackend, contextStyle });

    const [isTooltipVisible, setIsTooltipVisible] = useState(showHelp && value._class === ENTITIES.RESOURCE);

    const resourcesAsLinks = useSelector((state) => state.statementBrowser.resourcesAsLinks);
    const preferences = useSelector((state) => state.statementBrowser.preferences);
    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (value._class !== ENTITIES.LITERAL && (existingResourceId || contextStyle !== 'StatementBrowser') && openExistingResourcesInDialog) {
        handleOnClick = handleExistingResourceClick;
    } else if (value._class !== ENTITIES.LITERAL) {
        handleOnClick = handleResourceClick;
    }

    const dismissResourceTooltip = () => {
        cookies.set('showedValueHelp', true, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 2628000 });
        setIsTooltipVisible(false);
    };

    const Wrapper = !shouldDisableValueItemStyle ? ValueItemStyle : 'div';

    return (
        <>
            <Wrapper>
                {!value.isEditing || !enableEdit ? (
                    <div>
                        {!value.isSaving && (
                            <DescriptionTooltip
                                disabled={
                                    !preferences.showDescriptionTooltips ||
                                    !value.id ||
                                    (value?.classes?.includes(CLASSES.PROBLEM) && !resourcesAsLinks)
                                }
                                id={value?.id}
                                _class={value._class}
                                classes={value.classes}
                            >
                                <span tabIndex="0">
                                    {resource && !resource.isFetching && value._class !== ENTITIES.LITERAL && !resourcesAsLinks && (
                                        <>
                                            {!enableEdit && resource?.classes?.includes(CLASSES.PROBLEM) ? (
                                                <Link
                                                    href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                        researchProblemId: existingResourceId,
                                                        slug: resource.label,
                                                    })}
                                                    target="_blank"
                                                >
                                                    {resource.label} <Icon icon={faExternalLinkAlt} />
                                                </Link>
                                            ) : (
                                                <Tippy
                                                    visible={isTooltipVisible}
                                                    appendTo={document.body}
                                                    interactive
                                                    zIndex={1}
                                                    content={
                                                        <div className="p-1">
                                                            Click on a resource <br />
                                                            for more details.
                                                            <div className="text-end">
                                                                <Button
                                                                    color="link"
                                                                    size="sm"
                                                                    className="p-0 fw-bold text-decoration-none mt-2 text-white"
                                                                    onClick={dismissResourceTooltip}
                                                                >
                                                                    Got it
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <span>
                                                        <Button
                                                            className="p-0 text-start objectLabel"
                                                            color="link"
                                                            onClick={() => {
                                                                dismissResourceTooltip();
                                                                handleOnClick();
                                                            }}
                                                            style={{ userSelect: 'text' }}
                                                        >
                                                            {value._class === ENTITIES.CLASS && <div className="typeCircle">C</div>}
                                                            {value._class === ENTITIES.PREDICATE && <div className="typeCircle">P</div>}
                                                            {formattedLabel !== '' ? (
                                                                <ValuePlugins type="resource">{formattedLabel.toString()}</ValuePlugins>
                                                            ) : (
                                                                <i>No label</i>
                                                            )}
                                                            {resource && resource.existingResourceId && openExistingResourcesInDialog && (
                                                                <span>
                                                                    {' '}
                                                                    <Icon icon={faExternalLinkAlt} />
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </span>
                                                </Tippy>
                                            )}
                                        </>
                                    )}

                                    {resource && value._class !== ENTITIES.LITERAL && resourcesAsLinks && (
                                        <Link className="objectLabel" href={getResourceLink(value._class, value.resourceId)}>
                                            {value._class === ENTITIES.CLASS && <div className="typeCircle">C</div>}
                                            {value._class === ENTITIES.PREDICATE && <div className="typeCircle">P</div>}
                                            {value.label || <i>No label</i>}
                                        </Link>
                                    )}

                                    {resource && resource.isFetching && value._class === ENTITIES.RESOURCE && 'Loading...'}

                                    {value._class === ENTITIES.LITERAL && (
                                        <div className="literalLabel">
                                            {value.label !== '' ? (
                                                <ValuePlugins type={ENTITIES.LITERAL}>{value.label.toString()}</ValuePlugins>
                                            ) : (
                                                <i>No label</i>
                                            )}
                                        </div>
                                    )}
                                </span>
                            </DescriptionTooltip>
                        )}
                        {(preferences.showInlineDataTypes || value.classes?.includes(CLASSES.CSVW_TABLE)) && <ValueDatatype value={value} />}
                        {value.isSaving && 'Saving...'}
                        <ValueItemOptions id={id} enableEdit={enableEdit} syncBackend={syncBackend} handleOnClick={handleOnClick} />
                    </div>
                ) : (
                    <ValueForm id={id} syncBackend={syncBackend} />
                )}
            </Wrapper>

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal((prev) => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={Boolean(contextStyle === 'StatementBrowser' || existingResourceId)}
                    enableEdit={enableEdit && contextStyle !== 'StatementBrowser' && !existingResourceId}
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
    contextStyle: PropTypes.string,
    showHelp: PropTypes.bool,
    shouldDisableValueItemStyle: PropTypes.bool,
};

export default ValueItem;
