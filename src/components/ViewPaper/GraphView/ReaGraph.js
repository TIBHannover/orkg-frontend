import * as PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { GraphCanvas, useSelection, lightTheme } from 'reagraph';

export default function ReGraph(props) {
    const [collapsed, setCollapsed] = useState(['n-2']);
    const [active, setActive] = useState(null);
    const [mode, setMode] = useState('rotate');

    useEffect(() => {
        setCollapsed(collapsed);
    }, [collapsed]);

    const { onNodePointerOver, onNodePointerOut, selections, actives, onNodeClick, onCanvasClick } = useSelection({
        ref: props.graphRef,
        nodes: props.nodesz,
        edges: props.edgesz,
        pathSelectionType: 'all',
        pathHoverType: 'all',
    });
    const myTheme = {
        ...lightTheme,
        nodes: {
            ...lightTheme.node,
        },

        edges: {
            ...lightTheme.node,
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
            <div style={{ border: 'solid 1px red', margin: 15 }}>
                <GraphCanvas
                    draggable
                    ref={props.graphRef}
                    theme={myTheme}
                    edges={props.edgesz}
                    nodes={props.nodesz}
                    selections={selections}
                    collapsedNodeIds={collapsed}
                    layoutType={props.layoutType}
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
    nodesz: PropTypes.array,
    edgesz: PropTypes.array,
    layoutType: PropTypes.array,
    graphRef: PropTypes.array,
};
