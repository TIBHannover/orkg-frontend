import PropTypes from 'prop-types';
import { Handle, Position } from 'react-flow-renderer';
import styled from 'styled-components';

const StyledGroupHeader = styled.div`
    background: rgba(128, 134, 155, 0.8);
    color: #fff;
`;

function CustomGroup({ data }) {
    return (
        <>
            <StyledGroupHeader>{data.label}</StyledGroupHeader>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}

CustomGroup.propTypes = {
    data: PropTypes.object,
};
export default CustomGroup;
