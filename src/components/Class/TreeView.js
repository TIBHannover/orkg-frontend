import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { getChildrenByID, getHierarchyByID } from 'services/backend/classes';
import ROUTES from 'constants/routes';
import { useNavigate } from 'react-router-dom';
import { reverse } from 'named-urls';
import { cloneDeep } from 'lodash';
import AnimatedTree from './styled';

const treeify = (arr, arrChildren) => {
    const tree = [];
    const lookup = {};
    // Initialize lookup table with each array item's id as key and
    // its children initialized to an empty array
    arr.forEach(o => {
        lookup[o.id] = o;
        lookup[o.id].children = arrChildren[o.id] ?? [];
    });
    arr.forEach(o => {
        // If the item has a parent we do following:
        // 1. access it in constant time now that we have a lookup table
        // 2. since children is preconfigured, we simply push the item
        if (o.parent_id !== null) {
            lookup[o.parent_id].children.push({ ...o, children: arrChildren[o.id] ?? [] });
        } else {
            // no o.parent so this is a "root at the top level of our tree
            tree.push({ ...o, children: o.children });
        }
    });
    return tree;
};

const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: node => ({ height: node.scrollHeight }),
    onLeaveStart: node => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

function TreeView({ id, label }) {
    const treeContainerBody = useRef(null);
    const [data, setData] = useState([]);
    const [parents, setParents] = useState([]);
    const [isLoadingTrue, setIsLoadingTrue] = useState([]);
    const navigate = useNavigate();

    const onSelect = info => {
        if (info.length) {
            navigate(
                `${reverse(ROUTES.CLASS_TABS, {
                    id: info[0],
                    activeTab: 'tree',
                })}?noRedirect`,
            );
        }
    };

    const onExpand = (expandedKeys, { expanded, node, nativeEvent }) => {
        console.log(node);
    };

    useEffect(() => {
        const loadTree = async () => {
            setIsLoadingTrue(true);
            let hierarchy = await getHierarchyByID({ id });
            hierarchy = hierarchy.content.map(c => ({ ...c.class, parent_id: c.parent_id }));

            setParents(hierarchy.map(p => p.id));
            const parentsCalls = [];
            hierarchy.map(p => parentsCalls.push(getChildrenByID({ id: p.id })));
            const result = await Promise.all(parentsCalls);
            const list = {};
            result.map((r, index) => {
                list[hierarchy[index].id] = r.content
                    .filter(c => !hierarchy.map(p => p.id).includes(c.class.id))
                    .map(d => ({
                        ...d.class,
                        child_count: d.child_count,
                        isLeaf: d.child_count === 0,
                    }));
                return null;
            });
            const _data = treeify(hierarchy, list);
            setData(_data);
            setIsLoadingTrue(false);
        };
        loadTree();
    }, [id, label]);

    const fieldNames = {
        children: 'children',
        title: 'label',
        key: 'id',
    };

    const updatePropertyById = (_id, _data, property, value) => {
        const result = _data;
        if (_data.id === _id) {
            result[property] = value;
        }
        if (result.children !== undefined && result.children.length > 0) {
            for (let i = 0; i < result.children.length; i++) {
                result.children[i] = updatePropertyById(_id, result.children[i], property, value);
            }
        }
        return result;
    };

    const onLoadData = treeNode => {
        if (!treeNode.loaded) {
            return getChildrenByID({ id: treeNode.id }).then(_children => {
                const sChildren = _children.content.map(n => ({
                    ...n.class,
                    child_count: n.child_count,
                    isLeaf: n.child_count === 0,
                    loaded: false,
                }));
                const clonedData = cloneDeep(data);
                const updatedData = clonedData.map(r => updatePropertyById(treeNode.id, r, 'children', sChildren));
                setData(updatedData);
            });
        }
        return Promise().resolve();
    };

    return (
        <div className="py-4 px-4" ref={treeContainerBody}>
            {isLoadingTrue ? (
                'Loading...'
            ) : (
                <AnimatedTree
                    fieldNames={fieldNames}
                    defaultExpandedKeys={parents}
                    selectedKeys={[id]}
                    showLine
                    showIcon={false}
                    checkable={false}
                    onSelect={onSelect}
                    onExpand={onExpand}
                    loadData={onLoadData}
                    treeData={data}
                    motion={motion}
                />
            )}
        </div>
    );
}

TreeView.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default TreeView;
