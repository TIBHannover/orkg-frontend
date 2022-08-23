import { getSmoothStepPath, EdgeText, Position } from 'react-flow-renderer';
import PropTypes from 'prop-types';

const LeftOrRight = [Position.Left, Position.Right];

const getCenter = ({ sourceX, sourceY, targetX, targetY, sourcePosition = Position.Bottom, targetPosition = Position.Top }) => {
    const sourceIsLeftOrRight = LeftOrRight.includes(sourcePosition);
    const targetIsLeftOrRight = LeftOrRight.includes(targetPosition);

    // we expect flows to be horizontal or vertical (all handles left or right respectively top or bottom)
    // a mixed edge is when one the source is on the left and the target is on the top for example.
    const mixedEdge = (sourceIsLeftOrRight && !targetIsLeftOrRight) || (targetIsLeftOrRight && !sourceIsLeftOrRight);

    if (mixedEdge) {
        const xOffset = sourceIsLeftOrRight ? Math.abs(targetX - sourceX) : 0;
        const centerX = sourceX > targetX ? sourceX - xOffset : sourceX + xOffset;

        const yOffset = sourceIsLeftOrRight ? 0 : Math.abs(targetY - sourceY);
        const centerY = sourceY < targetY ? sourceY + yOffset : sourceY - yOffset;

        return [centerX, centerY, xOffset, yOffset];
    }

    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
};

const getMarkerEnd = (arrowHeadType, markerEndId) => {
    if (typeof markerEndId !== 'undefined' && markerEndId) {
        return `url(#${markerEndId})`;
    }

    // return typeof arrowHeadType !== 'undefined' ? `url(#react-flow__${arrowHeadType})` : 'none';
    return typeof arrowHeadType !== 'undefined' ? `url(#type=${arrowHeadType})` : 'none';
};

export default function CustomEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
    animated,
    sourcePosition,
    targetPosition,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    arrowHeadType = 'arrow',
    markerEndId,
    data,
    sourceHandleId,
    targetHandleId,
    borderRadius = 5,
}) {
    const [centerX, centerY] = getCenter({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

    const path = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius,
    });

    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const text = data?.label ? (
        <EdgeText
            x={centerX}
            y={centerY}
            label={data.label}
            labelStyle={labelStyle}
            labelShowBg={labelShowBg}
            labelBgStyle={labelBgStyle}
            labelBgPadding={labelBgPadding}
            labelBgBorderRadius={labelBgBorderRadius}
        />
    ) : null;

    return (
        <>
            <path style={style} className="react-flow__edge-path" d={path} markerEnd={markerEnd} />
            {text}
        </>
    );
}

CustomEdge.propTypes = {
    id: PropTypes.string,
    source: PropTypes.string,
    target: PropTypes.string,
    sourceX: PropTypes.number,
    sourceY: PropTypes.number,
    targetX: PropTypes.number,
    targetY: PropTypes.number,
    selected: PropTypes.bool,
    animated: PropTypes.bool,
    sourcePosition: PropTypes.string,
    targetPosition: PropTypes.string,
    label: PropTypes.string,
    labelStyle: PropTypes.object,
    labelShowBg: PropTypes.bool,
    labelBgStyle: PropTypes.object,
    labelBgPadding: PropTypes.array,
    labelBgBorderRadius: PropTypes.number,
    style: PropTypes.object,
    arrowHeadType: PropTypes.string,
    markerEndId: PropTypes.string,
    data: PropTypes.object,
    sourceHandleId: PropTypes.string,
    targetHandleId: PropTypes.string,
    borderRadius: PropTypes.number,
};
