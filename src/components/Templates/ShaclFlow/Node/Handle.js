import PropTypes from 'prop-types';
import { createContext, useContext, useRef } from 'react';
import { Handle, Position } from 'reactflow';

export const HandleContext = createContext();
export const HandleContextProvider = HandleContext.Provider;

export function useHandle() {
    return useContext(HandleContext);
}

function CustomHandle({ nodeId, ...props }) {
    const ref = useRef();

    return (
        <div
            className={`react-flow__handle-${props.position}`}
            style={{
                width: '10px',
                height: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                left: props.position === Position.Left ? -5 : null,
                right: props.position === Position.Right ? -5 : null,
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
                {...props}
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
}

CustomHandle.propTypes = {
    nodeId: PropTypes.string,
    position: PropTypes.string.isRequired,
};

export default CustomHandle;
