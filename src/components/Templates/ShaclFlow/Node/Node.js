import NodeFooter from 'components/Templates/ShaclFlow/Node/NodeFooter';
import NodeHeader from 'components/Templates/ShaclFlow/Node/NodeHeader';
import PropertyShape from 'components/Templates/ShaclFlow/Node/PropertyShape';
import TargetClass from 'components/Templates/ShaclFlow/Node/TargetClass';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const NodeStyled = styled.div`
    background:${props => props.theme.light};
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
    boxShadow: 0 1px 4px rgba(0, 0, 0, 0.2),
    overflow: 'hidden',
`;

function Node({ data }) {
    return (
        <NodeStyled>
            <NodeHeader label={data.label} id={data.id} />
            <div className="d-flex flex-column">
                <TargetClass data={data.class} nodeId={data.id} />

                {data.propertyShapes.map(ps => (
                    <PropertyShape key={ps.id} data={ps} nodeId={data.id} />
                ))}
            </div>
            <NodeFooter isClosed={data.isClosed} />
        </NodeStyled>
    );
}

Node.propTypes = {
    data: PropTypes.object.isRequired,
};

export default Node;
