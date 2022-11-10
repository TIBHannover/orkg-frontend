import { getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';
import PropTypes from 'prop-types';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { ENTITIES } from 'constants/graphSettings';

const getMarkerEnd = (arrowHeadType, markerEndId) => {
    if (typeof markerEndId !== 'undefined' && markerEndId) {
        return `url(#${markerEndId})`;
    }

    // return typeof arrowHeadType !== 'undefined' ? `url(#react-flow__${arrowHeadType})` : 'none';
    return typeof arrowHeadType !== 'undefined' ? `url(#type=${arrowHeadType})` : 'none';
};

export default function CustomEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    arrowHeadType = 'arrow',
    markerEndId,
    data,
    borderRadius = 5,
}) {
    const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius,
    });

    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    return (
        <>
            <path style={style} className="react-flow__edge-path" d={path} markerEnd={markerEnd} />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 10,
                    }}
                    className="nodrag nopan"
                >
                    <ConditionalWrapper
                        condition={data?.linked}
                        wrapper={children => (
                            <DescriptionTooltip _class={ENTITIES.PREDICATE} id={data?.id}>
                                {children}
                            </DescriptionTooltip>
                        )}
                    >
                        {data?.label}
                    </ConditionalWrapper>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

CustomEdge.propTypes = {
    sourceX: PropTypes.number,
    sourceY: PropTypes.number,
    targetX: PropTypes.number,
    targetY: PropTypes.number,
    sourcePosition: PropTypes.string,
    targetPosition: PropTypes.string,
    style: PropTypes.object,
    arrowHeadType: PropTypes.string,
    markerEndId: PropTypes.string,
    data: PropTypes.object,
    borderRadius: PropTypes.number,
};
