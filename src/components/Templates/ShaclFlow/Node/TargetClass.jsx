import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Handle from 'components/Templates/ShaclFlow/Node/Handle';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { Position } from 'reactflow';
import styled from 'styled-components';

const TargetClassStyled = styled.div`
    background: ${(props) => props.theme.secondaryDarker};
    color: ${(props) => props.theme.lightLighter};
    border-bottom: 1px solid #000;
`;

function TargetClass({ data, nodeId }) {
    return (
        <TargetClassStyled className="py-1 px-2 position-relative">
            <Handle type="target" position={Position.Left} nodeId={nodeId} />
            <div>
                {' '}
                <DescriptionTooltip id={data.id} _class={ENTITIES.CLASS} showURL>
                    {data.label}
                </DescriptionTooltip>
            </div>
        </TargetClassStyled>
    );
}

TargetClass.propTypes = {
    data: PropTypes.object.isRequired,
    nodeId: PropTypes.string.isRequired,
};

export default TargetClass;
