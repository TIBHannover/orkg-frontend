import * as PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { GraphCanvas, useSelection, lightTheme, useCollapse, getVisibleEntities } from 'reagraph';

export default function ReGraph(props) {
    const [collapsed, setCollapsed] = useState(['n-2']);
    // const { getExpandPathIds } = useCollapse({
    //     collapsedNodeIds: collapsed,
    //     nodes: props.nodesz,
    //     edges: props.edgesz,
    // });
    const [active, setActive] = useState(null);
    // const [mode, setMode] = useState('rotate');

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
        console.log('nodeId', nodeId);
        if (collapsed.includes(nodeId)) {
            setCollapsed(collapsed.filter(n => n !== nodeId));
        }
    }
    // const hiddenNodeIds = useMemo(() => {
    //     const { visibleNodes } = getVisibleEntities({
    //         collapsedIds: collapsed,
    //         nodes: props.nodesz,
    //         edges: props.edgesz,
    //     });
    //     const visibleNodeIds = visibleNodes.map(n => n.id);
    //     const hiddenNodes = props.nodesz.filter(n => !visibleNodeIds.includes(n.id));
    //     return hiddenNodes.map(n => n.id);
    // }, [collapsed]);

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
                {/* <h3>Hidden Nodes</h3>
                <ul>
                    {hiddenNodeIds.map(id => (
                        <li key={id}>
                            {id}
                            <button
                                style={{
                                    display: 'block',
                                    width: '100%',
                                }}
                                onClick={() => {
                                    const toExpandIds = getExpandPathIds(id.toString());
                                    const newCollapsed = collapsed.filter(id => !toExpandIds.includes(id));
                                    setCollapsed(newCollapsed);
                                }}
                            >
                                View Node
                            </button>
                        </li>
                    ))}
                </ul> */}
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
                    // cameraMode={mode}
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
    depth: PropTypes.array,
};
