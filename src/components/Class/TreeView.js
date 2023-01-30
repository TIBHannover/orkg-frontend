import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'react-arborist';
import { getRootByID, getChildrenByID, getParentByID } from 'services/backend/classes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faCircle, faMinus } from '@fortawesome/free-solid-svg-icons';
import useResizeObserver from 'use-resize-observer';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';

function Node({ node, style, dragHandle }) {
    /* This node instance can do many things. See the API reference. */
    return (
        <div style={style} ref={dragHandle} onClick={() => node.toggle()} onKeyDown={() => node.toggle()} role="button" tabIndex="0">
            {node.isLeaf ? (
                <Icon icon={faCircle} size="2xs" className="pe-1" />
            ) : (
                <>{node.isOpen ? <Icon icon={faMinus} className="pe-1" /> : <Icon icon={faPlus} className="pe-1" />}</>
            )}
            <Link to={reverse(ROUTES.CLASS_TABS, { id: node.data?.id, activeTab: 'tree' })} style={{ textDecoration: 'none' }}>
                {node.data.isMain ? <b>{node.data.label}</b> : node.data.label}
            </Link>
        </div>
    );
}

Node.propTypes = {
    node: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    dragHandle: PropTypes.func.isRequired,
};

function TreeView({ id, label }) {
    const treeContainerBody = useRef(null);
    const { width: containerBodyWidth } = useResizeObserver({ ref: treeContainerBody });
    const [data, setData] = useState([]);
    const [isLoadingTrue, setIsLoadingTrue] = useState([]);

    useEffect(() => {
        const loadTree = async () => {
            setIsLoadingTrue(true);
            let root = null;
            try {
                root = await getRootByID(id);
            } catch (error) {
                root = null;
            }
            const children = await getChildrenByID(id);
            let _data = { id, label, isMain: true, children: [...children.content] };
            if (root) {
                let parent = { id };
                while (parent?.id) {
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        parent = await getParentByID(parent.id);
                    } catch {
                        parent = null;
                    }

                    if (parent?.id) {
                        _data = { ...parent, children: [_data] };
                    }
                }
                setIsLoadingTrue(false);
                setData([_data]);
            } else {
                setIsLoadingTrue(false);
                setData([_data]);
            }
        };
        loadTree();
    }, [id, label]);

    return (
        <div className="py-4 px-4" ref={treeContainerBody}>
            {isLoadingTrue ? (
                'Loading...'
            ) : (
                <Tree disableDrag={true} disableEdit={true} data={data} width={containerBodyWidth} height={800}>
                    {Node}
                </Tree>
            )}
        </div>
    );
}

TreeView.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default TreeView;
