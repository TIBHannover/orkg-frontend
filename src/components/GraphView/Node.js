import { Ring, Sphere } from 'reagraph';
import PropTypes from 'prop-types';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Html } from '@react-three/drei';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo } from 'react';
import { functions, isEqual, omit } from 'lodash';

const COLOR_LITERAL = '#FFCC33';

const Node = ({ renderedNode, toggleExpandNode, collapsed }) => (
    <group onDoubleClick={() => toggleExpandNode(renderedNode.id)}>
        <mesh>
            {renderedNode.node.data._class === 'literal' ? (
                <>
                    <boxGeometry args={[30, 10, 10]} />
                    <meshBasicMaterial color={COLOR_LITERAL} />
                </>
            ) : (
                <Sphere {...renderedNode} />
            )}
            {((renderedNode.node.data.hasObjectStatements && !renderedNode.node.data.hasFetchedObjectStatements) ||
                collapsed.includes(renderedNode.id)) && <Ring opacity={0.4} size={renderedNode.size - 4} color={renderedNode.color} animated />}
            {renderedNode.node.data.isLoading && (
                <Html distanceFactor={180} position={[0, 0, 0]} transform>
                    <FontAwesomeIcon icon={faSpinner} spin className="text-white" style={{}} />
                </Html>
            )}
        </mesh>
    </group>
);

Node.propTypes = {
    renderedNode: PropTypes.object.isRequired,
    toggleExpandNode: PropTypes.func.isRequired,
    collapsed: PropTypes.array.isRequired,
};

export default memo(Node, (prevProps, nextProps) => isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps))));
