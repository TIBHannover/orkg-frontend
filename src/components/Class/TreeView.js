import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { orderBy } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChildrenByID, getHierarchyByID } from 'services/backend/classes';
import AnimatedTree, { motion } from './styled';

const treeify = (arr, arrChildren) => {
    const tree = [];
    const lookup = {};
    // Initialize lookup table with each array item's id as key and
    // its children initialized to its children without the one in the hierarchy
    arr.forEach(o => {
        lookup[o.id] = o;
        lookup[o.id].children = arrChildren[o.id] ?? [];
    });
    arr.forEach(o => {
        // If the item has a parent we do following:
        // 1. access it in constant time now that we have a lookup table
        // 2. since children is preconfigured, we simply push the item
        if (o.parent_id !== null) {
            lookup[o.parent_id].children.push(o);
        } else {
            // no o.parent so this is a "root at the top level of our tree
            tree.push({ ...o, children: o.children });
        }
    });
    return tree;
};

function TreeView({ id, label, ...props }) {
    const [treeData, setTreeData] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [isLoadingTrue, setIsLoadingTrue] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(id);

    useEffect(() => {
        setSelectedNodeId(id);
    }, [id]);

    const navigate = useNavigate();
    const SORT_NODES_BY = 'label';

    /** Navigate to the clicked class */
    const onSelect = (info, o) => {
        setSelectedNodeId(info?.[0] ?? id);
        if (props.onSelect) {
            props.onSelect(info, o);
        } else if (info.length) {
            // The selected node doesn't have info so the user stays on the same page
            navigate(
                `${reverse(ROUTES.CLASS_TABS, {
                    id: info[0],
                    activeTab: 'tree',
                })}?noRedirect`,
            );
        }
    };

    useEffect(() => {
        // Recursive function to sort the tree nodes by a property
        const sortChildrenByLabel = _value => {
            const result = _value;
            if (result.children?.length > 0) {
                result.children = orderBy(
                    result.children.map(c => sortChildrenByLabel(c)),
                    [c => c[SORT_NODES_BY].toLowerCase()],
                    ['asc'],
                );
            }
            return result;
        };
        // Initial load of data
        const loadTree = async () => {
            setIsLoadingTrue(true);
            let _hierarchy = await getHierarchyByID({ id });
            _hierarchy = _hierarchy.content.map(c => ({ ...c.class, parent_id: c.parent_id }));
            setHierarchy(_hierarchy);
            const parentsCalls = [];
            _hierarchy.map(p => parentsCalls.push(getChildrenByID({ id: p.id })));
            const result = await Promise.all(parentsCalls);
            const list = {};
            result.map((r, index) => {
                list[_hierarchy[index].id] = r.content
                    // remove the children that exist in the hierarchy
                    .filter(c => !_hierarchy.map(p => p.id).includes(c.class.id))
                    .map(d => ({
                        ...d.class,
                        child_count: d.child_count,
                        isLeaf: d.child_count === 0,
                    }));
                return null;
            });
            const _data = treeify(_hierarchy, list);
            setTreeData(
                orderBy(
                    _data.map(c => sortChildrenByLabel(c)),
                    [c => c[SORT_NODES_BY].toLowerCase()],
                    ['asc'],
                ),
            );
            setIsLoadingTrue(false);
        };
        loadTree();
    }, [id, label]);

    // Customize node title, key, children field name
    const fieldNames = {
        children: 'children',
        title: 'label',
        key: 'id',
    };

    // Recursive function to update a property in a nested structure of nodes
    const updatePropertyNodeById = (_id, _node, property, value) => {
        const result = _node;
        if (_node.id === _id) {
            result[property] = value;
        }
        if (result.children?.length > 0) {
            result.children = result.children.map(cn => updatePropertyNodeById(_id, cn, property, value));
        }
        return result;
    };

    // Load data asynchronously
    const onLoadData = node => {
        if (!node.loaded) {
            return getChildrenByID({ id: node.id }).then(_children => {
                // Sort children by label
                const sChildren = orderBy(
                    _children.content.map(n => ({
                        ...n.class,
                        child_count: n.child_count,
                        isLeaf: n.child_count === 0,
                        loaded: false,
                    })),
                    [c => c[SORT_NODES_BY].toLowerCase()],
                    ['asc'],
                );
                // Update the current tree by setting the children at right node
                setTreeData(prevTreeData => prevTreeData.map(n => updatePropertyNodeById(node.id, n, 'children', sChildren)));
            });
        }
        return Promise().resolve();
    };

    // Customize tree node title render
    const titleRender = nodeData => (
        <DescriptionTooltip id={nodeData.id} _class={ENTITIES.CLASS}>
            {nodeData.label}
        </DescriptionTooltip>
    );

    return (
        <div className="py-4 px-4">
            {isLoadingTrue ? (
                'Loading...'
            ) : (
                <AnimatedTree
                    fieldNames={fieldNames}
                    defaultExpandedKeys={hierarchy.map(p => p.id)}
                    selectedKeys={[selectedNodeId]}
                    showLine={true}
                    titleRender={titleRender}
                    showIcon={false}
                    checkable={false}
                    onSelect={onSelect}
                    loadData={onLoadData}
                    treeData={treeData}
                    motion={motion}
                />
            )}
        </div>
    );
}

TreeView.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onSelect: PropTypes.func,
};

export default TreeView;
