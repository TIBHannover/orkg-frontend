import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import CopyId from '@/components/CopyId/CopyId';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

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
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <h4 className="text-2xl m-0 mr-2">Property</h4>
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
        <div className="mt-2 break-all">{selectedEdge?.propertyId && <div>{selectedEdge?.label}</div>}</div>
    </StyledBox>
);

SelectedEdgeBox.propTypes = {
    selectedEdge: PropTypes.object,
};

export default SelectedEdgeBox;
