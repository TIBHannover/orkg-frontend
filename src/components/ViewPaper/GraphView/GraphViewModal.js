import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import uniqBy from 'lodash/uniqBy';
import ReGraph from './ReaGraph';

const GraphViewModal = props => {
    const { isOpen, toggle, paperId } = props;

    const [nodesz, setNodes] = useState([]);
    const [edgesz, setEdges] = useState([]);
    const [statements, setStatements] = useState([]);
    const [windowHeight, setWindowHeight] = useState(0);

    const updateDimensions = () => {
        const offset = 28 * 2 + 65;
        setWindowHeight(window.innerHeight - offset);
    };
    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const processStatements = auxNode => {
        let nodes = [];
        let edges = [];
        for (const statement of statements) {
            const subjectLabel = statement.subject.label.substring(0, 20);
            const objectLabel = statement.object.label.substring(0, 20);

            nodes.push({
                id: statement.subject.id,
                label: subjectLabel,
                title: statement.subject.label,
                classificationArray: statement.subject.classes,
            });
            console.log('statemne statement.object._class', statement.object);
            // check if node type is resource or literal
            if (statement.object._class === 'resource') {
                nodes.push({
                    id: statement.object.id,
                    label: objectLabel,
                    title: statement.object.label,
                    fill: 'blue',
                    classificationArray: statement.object.classes,
                    isResearchFieldRelated:
                        statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD || statement.predicate.id === PREDICATES.HAS_SUB_RESEARCH_FIELD,
                });
            } else {
                nodes.push({
                    id: statement.object.id,
                    label: objectLabel,
                    title: statement.object.label,
                    type: 'literal',
                    fill: 'yellow',
                    border: '1px solid black',
                });
            }

            if (statement.predicate.id === 'P27') {
                // add user Icon to target node if we have 'has author' property === P27
                edges.push({
                    source: statement.subject.id,
                    target: statement.object.id,
                    label: statement.predicate.label,
                    isAuthorProp: true,
                    id: statement.predicate.id,
                });
            } else if (statement.predicate.id === 'P26') {
                // add DOI Icon to target node
                edges.push({
                    source: statement.subject.id,
                    target: statement.object.id,
                    label: statement.predicate.label,
                    isDOIProp: false,
                    id: statement.predicate.id,
                }); // remove doi icon for now
            } else {
                // no Icon for the target node
                edges.push({
                    source: statement.subject.id,
                    target: statement.object.id,
                    label: statement.predicate.label,
                    id: statement.predicate.id,
                });
            }
        }
        // remove duplicate nodes ans edges
        nodes = uniqBy(nodes, 'id');
        edges = uniqBy(edges, e => [e.source, e.target, e.label].join());

        if (auxNode) {
            // find node with paper resource ID;
            // heuristic its always node 0;
            // >> auxNode will only be set in the loadStatements function (only depth 0 statements)
            // which is only called on onOpened()

            const meta = {
                id: '__META_NODE__',
                label: 'Meta Information',
                title: 'Meta Information',
                classificationArray: [],
                fill: 'green',
            };
            const link = {
                source: nodes[0]?.id || '__META_NODE__',
                target: meta.id,
                label: 'has meta information',
            };

            nodes.push(meta);
            edges.push(link);

            edges.forEach(edge => {
                if (edge.id) {
                    if (
                        edge.id === PREDICATES.HAS_DOI ||
                        edge.id === PREDICATES.HAS_VENUE ||
                        edge.id === PREDICATES.HAS_AUTHOR ||
                        edge.id === PREDICATES.HAS_PUBLICATION_MONTH ||
                        edge.id === PREDICATES.HAS_PUBLICATION_YEAR ||
                        edge.id === PREDICATES.HAS_RESEARCH_FIELD ||
                        edge.id === PREDICATES.HAS_SUB_RESEARCH_FIELD ||
                        edge.id === PREDICATES.URL
                    ) {
                        edge.from = meta.id;
                    }
                }
            });
        }
        return { nodes, edges };
    };

    const fetchData = async () => {
        if (isOpen && paperId) {
            const statements = await getStatementsBySubject({ id: paperId });
            if (statements.length === 0) {
                return {}; // we don't have incremental data
            }
            // result is the incremental data we get;
            setStatements(statements);
            const auxiliaryMetaDataNode = true; // flag for using or not using auxiliary node for meta info
            const result = processStatements(auxiliaryMetaDataNode);
            setNodes(result?.nodes);
            setEdges(result?.edges);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isOpen, paperId]);

    return (
        <Modal
            size="lg"
            isOpen={isOpen}
            toggle={toggle}
            onOpened={() => {
                fetchData();
            }}
            style={{ maxWidth: '90%', marginBottom: 0 }}
        >
            <ModalHeader toggle={toggle}>
                {' '}
                <div style={{ width: '300px', height: '40px', paddingTop: '5px' }}>Paper graph visualization</div>
            </ModalHeader>
            <ModalBody style={{ padding: '0', minHeight: '100px', height: windowHeight }}>
                <ReGraph nodesz={nodesz} edgesz={edgesz} />
            </ModalBody>
        </Modal>
    );
};

GraphViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperId: PropTypes.string,
};

export default GraphViewModal;
