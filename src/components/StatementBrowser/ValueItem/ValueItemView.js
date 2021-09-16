import { Button, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { getResourceLink } from 'utils';
import ValueItemOptions from './ValueItemOptions/ValueItemOptions';
import ValueForm from 'components/StatementBrowser/ValueForm/ValueForm';

export default function ValueItemView(props) {
    const resourcesAsLinks = useSelector(state => state.statementBrowser.resourcesAsLinks);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    {props.resource && !props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && !resourcesAsLinks && (
                        <Button className="p-0 text-left objectLabel" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value._class === ENTITIES.RESOURCE ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">
                                        {props.getLabel() !== '' ? props.getLabel().toString() : <i>No label</i>}
                                    </ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{props.getLabel() !== '' ? props.getLabel().toString() : <i>No label</i>}</ValuePlugins>
                            )}
                            {props.resource && props.resource.existingResourceId && openExistingResourcesInDialog && (
                                <span>
                                    {' '}
                                    <Icon icon={faExternalLinkAlt} />
                                </span>
                            )}
                        </Button>
                    )}

                    {props.resource && props.value._class !== ENTITIES.LITERAL && resourcesAsLinks && (
                        <Link className="objectLabel" to={getResourceLink(props.value._class, props.value.resourceId)}>
                            {props.value.label || <i>No label</i>}
                        </Link>
                    )}

                    {props.resource && props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && 'Loading...'}

                    {props.value._class === ENTITIES.LITERAL && (
                        <div className="literalLabel">
                            <ValuePlugins type={ENTITIES.LITERAL}>
                                {props.value.label !== '' ? props.value.label.toString() : <i>No label</i>}
                            </ValuePlugins>
                            {isCurationAllowed && (
                                <small>
                                    <Badge color="light" className="ml-2">
                                        {props.value.datatype}
                                    </Badge>
                                </small>
                            )}
                        </div>
                    )}

                    <ValueItemOptions
                        id={props.id}
                        enableEdit={props.enableEdit}
                        syncBackend={props.syncBackend}
                        handleOnClick={props.handleOnClick}
                    />
                </div>
            ) : (
                <ValueForm id={props.id} syncBackend={props.syncBackend} />
            )}
        </ValueItemStyle>
    );
}

ValueItemView.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    resource: PropTypes.object,
    handleOnClick: PropTypes.func,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    getLabel: PropTypes.func.isRequired
};
