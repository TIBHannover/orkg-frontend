import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import styled from 'styled-components';

import CopyId from '@/components/CopyId/CopyId';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResourceLink } from '@/utils';

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
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <h2 className="text-2xl m-0 mr-2">{selectedNode.data._class === ENTITIES.RESOURCE ? 'Resource' : 'Literal'}</h2>
                {selectedNode.data._class === ENTITIES.RESOURCE && (
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: selectedNode.id })}?noRedirect`} target="_blank">
                        <Tooltip content="View resource">
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </Tooltip>
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
                    <div className="text-gray-500 text-sm">
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
                <ButtonGroup className="flex">
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
