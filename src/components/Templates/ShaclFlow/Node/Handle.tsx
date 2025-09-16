import { Handle, Position } from '@xyflow/react';
import { FC, useRef } from 'react';

type CustomHandleProps = {
    id: string;
    position: Position;
    type: 'source' | 'target';
};

const CustomHandle: FC<CustomHandleProps> = ({ id, position, type }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            className={`react-flow__handle-${position}`}
            style={{
                width: '10px',
                height: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                left: position === Position.Left ? -5 : undefined,
                right: position === Position.Right ? -5 : undefined,
            }}
        >
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    border: '1px solid #c61d1d',
                    background: '#e86161',
                }}
            />
            <Handle
                ref={ref}
                id={id}
                type={type}
                position={position}
                isConnectableStart={false}
                style={{
                    border: 'none',
                    background: 'transparent',
                    width: '10px',
                    height: '10px',
                    right: 0,
                    left: 0,
                }}
            />
        </div>
    );
};

export default CustomHandle;
