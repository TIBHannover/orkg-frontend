import PropTypes from 'prop-types';
import { Handle, Position } from 'react-flow-renderer';
import styled from 'styled-components';

const StyledGroupHeader = styled.div`
    background: ${props => props.theme.secondary};
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
