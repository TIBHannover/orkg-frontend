import Link from 'components/NextJsMigration/Link';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import CopyId from 'components/CopyId/CopyId';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import { getResourceLink } from 'utils';

const StyledBox = styled.div`
    position: absolute;
    right: 10px;
    top: 10px;
    border-radius: ${(props) => props.theme.borderRadius};
    background: ${(props) => props.theme.light};
    width: 300px;
    z-index: 1;
    padding: 10px;
`;

const SelectedNodeBox = ({ nodes, selectedNode, getExpandButtonLabel, toggleExpandNode, fetchIncomingStatements }) => (
    <StyledBox>
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <h2 className="h4 m-0 me-2">{selectedNode.data._class === ENTITIES.RESOURCE ? 'Resource' : 'Literal'}</h2>
                {selectedNode.data._class === ENTITIES.RESOURCE && (
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: selectedNode.id })}?noRedirect`} target="_blank">
                        <Tippy content="View resource">
                            <Icon icon={faExternalLinkAlt} />
                        </Tippy>
                    </Link>
                )}
            </div>
            <div>
                <CopyId id={selectedNode.id} />
            </div>
        </div>

        <div className="mt-2" style={{ overflowX: 'auto' }}>
            {selectedNode.data._class === ENTITIES.LITERAL && <ValuePlugins type={ENTITIES.LITERAL}>{selectedNode.data.label}</ValuePlugins>}
            {selectedNode.data._class !== ENTITIES.LITERAL && selectedNode.data.label}
        </div>
        {selectedNode.data._class === ENTITIES.RESOURCE && (
            <>
                {selectedNode.data.classes?.length > 0 && (
                    <div className="text-muted small">
                        Instance of{' '}
                        <span>
                            {selectedNode.data.classes.map((c, index) => (
                                <Fragment key={index}>
                                    <Link href={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                        {c}
                                    </Link>
                                    {index + 1 < selectedNode.data.classes.length && ','}
                                </Fragment>
                            ))}
                        </span>
                    </div>
                )}

                <hr />
                <ButtonGroup className="d-flex">
                    <Button
                        disabled={!nodes.find((node) => node.id === selectedNode.id).data.hasObjectStatements}
                        color="primary"
                        size="sm"
                        onClick={() => toggleExpandNode(selectedNode.id)}
                        style={{ marginRight: 2 }}
                    >
                        {getExpandButtonLabel(nodes.find((node) => node.id === selectedNode.id).data)}
                    </Button>
                    <Button color="primary" size="sm" onClick={() => fetchIncomingStatements(selectedNode.id)}>
                        Fetching incoming
                    </Button>
                </ButtonGroup>
            </>
        )}
    </StyledBox>
);

SelectedNodeBox.propTypes = {
    nodes: PropTypes.array.isRequired,
    selectedNode: PropTypes.object.isRequired,
    getExpandButtonLabel: PropTypes.func.isRequired,
    toggleExpandNode: PropTypes.func.isRequired,
    fetchIncomingStatements: PropTypes.func.isRequired,
};

export default SelectedNodeBox;
