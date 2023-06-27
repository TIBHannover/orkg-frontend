// import './style.css';

import * as PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import { GraphCanvas, useSelection, lightTheme } from 'reagraph';

export default function ReGraph(props) {
    // console.log('show props', props);
    // const myTheme = {
    //     ...lightTheme,
    //     node: {
    //         ...lightTheme.node,
    //         color: '#000',
    //     },
    // };

    // return (
    //     <div className="App">
    //         <div style={{ border: 'solid 1px red', margin: 15, width: 800, height: 800 }}>
    //             <GraphCanvas theme={myTheme} edges={props.edgesz} nodes={props.nodesz} />
    //         </div>
    //     </div>
    // );
    const graphRef = useRef();
    const [collapsed, setCollapsed] = useState(['n-2']);
    const [active, setActive] = useState(null);
    const [mode, setMode] = useState('rotate');
    const [layoutType, setLayoutType] = useState('forceDirected2d');

    useEffect(() => {
        setCollapsed(collapsed);
    }, [collapsed]);

    const { onNodePointerOver, onNodePointerOut, selections, actives, onNodeClick, onCanvasClick } = useSelection({
        ref: graphRef,
        nodes: props.nodesz,
        edges: props.edgesz,
        pathSelectionType: 'all',
        pathHoverType: 'all',
    });
    const myTheme = {
        ...lightTheme,
        node: {
            ...lightTheme.node,
            color: '#000',
        },
    };
    function handleCollapseNode(nodeId) {
        if (!collapsed.includes(nodeId)) {
            setCollapsed([...collapsed, nodeId]);
        }
    }

    function handleExpandNode(nodeId) {
        if (collapsed.includes(nodeId)) {
            setCollapsed(collapsed.filter(n => n !== nodeId));
        }
    }
    const handleLayoutChange = newLayoutType => {
        setLayoutType(newLayoutType);
    };
    return (
        <div className="App">
            <div
                style={{
                    zIndex: 9,
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    background: 'rgba(0, 0, 0, .5)',
                    padding: 1,
                    color: 'white',
                }}
            >
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => graphRef.current?.centerGraph()}
                >
                    Center
                </button>

                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => graphRef.current?.zoomIn()}
                >
                    Zoom In
                </button>
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => graphRef.current?.zoomOut()}
                >
                    Zoom Out
                </button>

                <br />
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => handleLayoutChange('forceDirected2d')}
                >
                    ForceDirected
                </button>
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => handleLayoutChange('treeTd2d')}
                >
                    Tree Top Down
                </button>
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => handleLayoutChange('treeLr2d')}
                >
                    Tree Left Right
                </button>

                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => handleLayoutChange('radialOut2d')}
                >
                    RadialOut
                </button>

                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => handleLayoutChange('circular2d')}
                >
                    Circular
                </button>
                <br />
                <button
                    style={{
                        display: 'block',
                        width: '100%',
                    }}
                    onClick={() => setMode(mode === 'orbit' ? 'rotate' : 'orbit')}
                >
                    Enable/Disable Orbit
                </button>
                {active ? (
                    <>
                        Selected: {active.node.id}
                        <br />
                        <button
                            style={{
                                display: 'block',
                                width: '100%',
                            }}
                            onClick={() => handleCollapseNode(active.node.id)}
                        >
                            Collapse Node
                        </button>
                        <button
                            style={{
                                display: 'block',
                                width: '100%',
                            }}
                            onClick={() => handleExpandNode(active.node.id)}
                        >
                            Expand Node
                        </button>
                    </>
                ) : (
                    <>Click a node to see options</>
                )}
                <h3>Collapsed Nodes</h3>
                <code>
                    <pre>{JSON.stringify(collapsed, null, 2)}</pre>
                </code>
            </div>
            <div style={{ border: 'solid 1px red', margin: 15, width: 800, height: 800 }}>
                <GraphCanvas
                    draggable
                    ref={graphRef}
                    theme={myTheme}
                    edges={props.edgesz}
                    nodes={props.nodesz}
                    selections={selections}
                    collapsedNodeIds={collapsed}
                    layoutType={layoutType}
                    labelType="all"
                    actives={actives}
                    cameraMode={mode}
                    onNodeClick={node => {
                        if (onNodeClick) {
                            onNodeClick(node);
                        }

                        setActive({
                            node,
                            props,
                        });
                    }}
                    onNodePointerOver={onNodePointerOver}
                    onNodePointerOut={onNodePointerOut}
                    onCanvasClick={onCanvasClick}
                />
            </div>
        </div>
    );
}
ReGraph.propTypes = {
    // eslint-disable-next-line no-undef
    nodesz: PropTypes.array,
    edgesz: PropTypes.array,
};
