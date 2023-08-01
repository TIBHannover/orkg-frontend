import { Ring, Sphere } from 'reagraph';
import PropTypes from 'prop-types';

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
                collapsed.includes(renderedNode.id)) && (
                <Ring opacity={0.4} size={renderedNode.size - 4} color={renderedNode.color} animated={true} />
            )}
        </mesh>
    </group>
);

Node.propTypes = {
    renderedNode: PropTypes.object.isRequired,
    toggleExpandNode: PropTypes.func.isRequired,
    collapsed: PropTypes.array.isRequired,
};

export default Node;
