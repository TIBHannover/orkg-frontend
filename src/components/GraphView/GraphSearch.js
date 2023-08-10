import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { getVisibleEntities, useCollapse } from 'reagraph';

const GraphSearch = ({ nodes, edges, setSelections, collapsed, setCollapsed, graphRef }) => {
    const [foundNodeId, setFoundNodeId] = useState(null);

    const { getExpandPathIds } = useCollapse({
        collapsedNodeIds: collapsed,
        nodes,
        edges,
    });

    const { visibleNodes } = getVisibleEntities({
        collapsedIds: collapsed,
        nodes,
        edges,
    });

    const hiddenNodeIds = useMemo(() => {
        const visibleNodeIds = visibleNodes.map(n => n.id);
        const hiddenNodes = nodes.filter(n => !visibleNodeIds.includes(n.id));
        return hiddenNodes.map(n => n.id);
    }, [nodes, visibleNodes]);

    const handleSearch = item => {
        // for input is cleared
        if (!item) {
            return;
        }

        const toExpandIds = getExpandPathIds(item.id);
        const newCollapsed = collapsed.filter(id => !toExpandIds.includes(id));
        setCollapsed(newCollapsed);
        setFoundNodeId(item.id);
    };

    useEffect(() => {
        if (foundNodeId && visibleNodes.find(node => node.id === foundNodeId)) {
            // dirty hack: the timeout is required to ensure that the node is rendered before centering
            setTimeout(() => {
                if (graphRef?.current?.getGraph()?._nodes.get(foundNodeId)) {
                    setSelections(foundNodeId);
                    graphRef.current?.centerGraph([foundNodeId]);
                    setFoundNodeId(false);
                }
            }, 0);
        }
    }, [graphRef, hiddenNodeIds, setSelections, foundNodeId, visibleNodes]);

    return (
        <>
            <Select
                onChange={handleSearch}
                options={nodes.map(node => ({ label: node.data.label, id: node.id }))}
                placeholder="Search in graph..."
                classNamePrefix="react-select"
                isClearable
                getOptionValue={({ id }) => id}
                getOptionLabel={({ label }) => label}
                styles={{
                    menu: provided => ({ ...provided, zIndex: 2 }),
                }}
            />
            <SelectGlobalStyle />
        </>
    );
};

GraphSearch.propTypes = {
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setSelections: PropTypes.func.isRequired,
    collapsed: PropTypes.array.isRequired,
    setCollapsed: PropTypes.func.isRequired,
    graphRef: PropTypes.object.isRequired,
};

export default GraphSearch;
