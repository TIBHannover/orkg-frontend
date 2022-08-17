import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledGroupHeader = styled.div`
    background: ${props => props.theme.secondary};
    color: #fff;
`;

function CustomGroup({ data }) {
    return (
        <>
            <StyledGroupHeader>{data.label}</StyledGroupHeader>
        </>
    );
}

CustomGroup.propTypes = {
    data: PropTypes.object,
};
export default CustomGroup;
