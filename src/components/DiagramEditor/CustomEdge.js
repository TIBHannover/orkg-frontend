import { getSmoothStepPath, Position } from 'react-flow-renderer';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

const StyledForeignObject = styled.foreignObject`
    overflow: visible;
`;

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

    const size = data?.label?.length ?? 20;
    return (
        <>
            <path style={style} className="react-flow__edge-path" d={path} markerEnd={markerEnd} />
            <StyledForeignObject height={1} width={1} x={centerX - size / 2} y={centerY - size / 2}>
                <div xmlns="http://www.w3.org/1999/xhtml">
                    <Tippy
                        disabled={!data}
                        content={
                            <>
                                ID: {data?.id}
                                <br />
                                Label: {data?.label}
                            </>
                        }
                        interactive={true}
                        appendTo={document.body}
                    >
                        <span>{data?.label}</span>
                    </Tippy>
                </div>
            </StyledForeignObject>
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
    style: PropTypes.object,
    arrowHeadType: PropTypes.string,
    markerEndId: PropTypes.string,
    data: PropTypes.object,
    sourceHandleId: PropTypes.string,
    targetHandleId: PropTypes.string,
    borderRadius: PropTypes.number,
};
