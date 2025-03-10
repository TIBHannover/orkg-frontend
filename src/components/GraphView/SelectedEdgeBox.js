import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CopyId from 'components/CopyId/CopyId';
import Tooltip from 'components/FloatingUI/Tooltip';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

const SelectedEdgeBox = ({ selectedEdge }) => (
    <StyledBox>
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <h4 className="h4 m-0 me-2">Property</h4>
                {selectedEdge && (
                    <Link href={`${reverse(ROUTES.PROPERTY, { id: selectedEdge?.propertyId })}?noRedirect`} target="_blank">
                        <Tooltip content="View property">
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </Tooltip>
                    </Link>
                )}
            </div>
            <div>
                <CopyId id={selectedEdge?.propertyId} />
            </div>
        </div>
        <div className="mt-2 text-break">{selectedEdge?.propertyId && <div>{selectedEdge?.label}</div>}</div>
    </StyledBox>
);

SelectedEdgeBox.propTypes = {
    selectedEdge: PropTypes.object,
};

export default SelectedEdgeBox;
