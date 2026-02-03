import { orderBy } from 'lodash';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnimatedTree, { motion } from '@/components/Class/styled';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getChildrenByID, getHierarchyByID } from '@/services/backend/classes';

export type TreeNode = {
    id: string;
    label: string;
    parent_id: string | null;
    children: TreeNode[];
    child_count?: number;
    isLeaf?: boolean;
    loaded?: boolean;
};

const treeify = (arr: TreeNode[], arrChildren: Record<string, TreeNode[]>) => {
    const tree: TreeNode[] = [];
    const lookup: Record<string, TreeNode> = {};
    // Initialize lookup table with each array item's id as key and
    // its children initialized to its children without the one in the hierarchy
    arr.forEach((o) => {
        lookup[o.id] = o;
        lookup[o.id].children = arrChildren[o.id] ?? [];
    });
    arr.forEach((o) => {
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

type TreeViewProps = {
    id: string;
    rootNodeId?: string; // The node id of the root node of the tree (if not provided, the whole tree is displayed)
    reloadTree?: boolean;
    onSelect?: (selectedKeys: string[], { node }: { node: TreeNode }) => void;
};

const TreeView = ({ id, rootNodeId, reloadTree, ...props }: TreeViewProps) => {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [hierarchy, setHierarchy] = useState<TreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(id);

    useEffect(() => {
        setSelectedNodeId(id);
    }, [id]);

    const router = useRouter();
    const SORT_NODES_BY = 'label';

    /** Navigate to the clicked class */
    const onSelect = (selectedKeys: string[], { node }: { node: TreeNode }) => {
        setSelectedNodeId(node.id);
        if (props.onSelect) {
            props.onSelect(selectedKeys, { node });
        } else if (selectedKeys.length) {
            // The selected node doesn't have info so the user stays on the same page
            router.push(
                `${reverse(ROUTES.CLASS_TABS, {
                    id: selectedKeys[0],
                    activeTab: 'information',
                })}?noRedirect`,
            );
        }
    };

    useEffect(() => {
        // Recursive function to sort the tree nodes by a property
        const sortChildrenByLabel = (value: TreeNode): TreeNode => {
            const result = { ...value };
            if (result.children?.length > 0) {
                result.children = orderBy(
                    result.children.map((c) => sortChildrenByLabel(c)),
                    [(c) => c[SORT_NODES_BY].toLowerCase()],
                    ['asc'],
                );
            }
            return result;
        };
        // Initial load of data
        const loadTree = async () => {
            setIsLoading(true);
            const hierarchyResponse = await getHierarchyByID({ id });
            const hierarchyNodes: TreeNode[] = hierarchyResponse.content.map((c) => ({
                ...c._class,
                parent_id: c.parentId !== null ? String(c.parentId) : null,
                children: [],
            }));
            let filteredHierarchyNodes = hierarchyNodes;
            if (rootNodeId) {
                const rootIndex = hierarchyNodes.findIndex((node) => node.id === rootNodeId);
                if (rootIndex !== -1) {
                    filteredHierarchyNodes = hierarchyNodes.slice(rootIndex).map((node, index) => ({
                        ...node,
                        parent_id: index === 0 ? null : node.parent_id,
                    }));
                }
            }
            setHierarchy(filteredHierarchyNodes);
            const parentsCalls = filteredHierarchyNodes.map((p) => getChildrenByID({ id: p.id }));
            const result = await Promise.all(parentsCalls);
            const list: Record<string, TreeNode[]> = {};
            const filteredHierarchyIds = new Set(filteredHierarchyNodes.map((p) => p.id));
            result.forEach((r, index) => {
                const children = r.content;
                list[filteredHierarchyNodes[index].id] = children
                    // remove the children that exist in the hierarchy
                    .filter((c) => !filteredHierarchyIds.has(c._class.id))
                    .map((d) => ({
                        ...d._class,
                        parent_id: null,
                        children: [],
                        child_count: d.childCount,
                        isLeaf: d.childCount === 0,
                        loaded: false,
                    }));
            });
            const _data = treeify(filteredHierarchyNodes, list);
            setTreeData(
                orderBy(
                    _data.map((c) => sortChildrenByLabel(c)),
                    [(c) => c[SORT_NODES_BY].toLowerCase()],
                    ['asc'],
                ),
            );
            setIsLoading(false);
        };
        loadTree();
    }, [id, reloadTree, rootNodeId]);

    // Customize node title, key, children field name
    const fieldNames = {
        children: 'children',
        title: 'label',
        key: 'id',
    };

    // Recursive function to update a property in a nested structure of nodes
    const updatePropertyNodeById = <K extends keyof TreeNode>(nodeId: string, node: TreeNode, property: K, value: TreeNode[K]): TreeNode => {
        const result = { ...node };
        if (node.id === nodeId) {
            result[property] = value;
        }
        if (result.children?.length > 0) {
            result.children = result.children.map((cn) => updatePropertyNodeById(nodeId, cn, property, value));
        }
        return result;
    };

    // Load data asynchronously
    const onLoadData = (node: { id: string; loaded?: boolean }): Promise<void> => {
        if (node.loaded) {
            return Promise.resolve();
        }
        return getChildrenByID({ id: node.id }).then((_children) => {
            // Sort children by label
            const children = _children.content;
            const sChildren: TreeNode[] = orderBy(
                children.map((n) => ({
                    ...n._class,
                    parent_id: null,
                    children: [],
                    child_count: n.childCount,
                    isLeaf: n.childCount === 0,
                    loaded: false,
                })),
                [(c) => c[SORT_NODES_BY].toLowerCase()],
                ['asc'],
            );
            // Update the current tree by setting the children at right node
            setTreeData((prevTreeData) => prevTreeData.map((n) => updatePropertyNodeById(node.id, n, 'children', sChildren)));
        });
    };

    // Customize tree node title render
    const titleRender = (nodeData: { id: string; label: string }) => (
        <DescriptionTooltip id={nodeData.id} _class={ENTITIES.CLASS}>
            {nodeData.label}
        </DescriptionTooltip>
    );

    return (
        <div className="py-4 px-4">
            {isLoading ? (
                'Loading...'
            ) : (
                <AnimatedTree
                    fieldNames={fieldNames}
                    defaultExpandedKeys={hierarchy.map((p) => p.id)}
                    selectedKeys={[selectedNodeId]}
                    showLine
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
};

export default TreeView;
