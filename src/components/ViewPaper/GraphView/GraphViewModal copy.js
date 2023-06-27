import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import uniqBy from 'lodash/uniqBy';
import flattenDeep from 'lodash/flattenDeep';
import ReGraph from './ReaGraph';

const GraphViewModal = props => {
    const { isOpen, toggle, header, content, paperId } = props;

    // console.log('addPaper', props.addPaper);
    // const childRef = useRef(null);
    const [nodes, setNodes] = useState({});
    const [edges, setEdges] = useState({});
    const [statements, setStatements] = useState([]);

    const [depths, setDepths] = useState(1);
    const [initializeGraph, setInitializeGraph] = useState(false);
    // const [seenDepth, setSeenDepth] = useState(-1);
    const [isLoadingStatements, setIsLoadingStatements] = useState(false);
    // const [maxDepth, setMaxDepth] = useState(25);
    // const [seenFullGraph, setSeenFullGraph] = useState(false);
    // const [layoutSelectionOpen, setLayoutSelectionOpen] = useState(false);
    // const [exploringFullGraph, setExploringFullGraph] = useState(false);
    // const [layout, setLayout] = useState('force');
    // const [windowHeight, setWindowHeight] = useState(0);

    const processSingleStatement = (nodes, edges, statement) => {
        const subjectLabel = statement.subject.label.substring(0, 20);
        const objectLabel = statement.object.label.substring(0, 20);

        nodes.push({
            id: statement.subject.id,
            label: subjectLabel,
            title: statement.subject.label,
            classificationArray: statement.subject.classes,
        });

        // check if node type is resource or literal
        if (statement.object._class === 'resource') {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
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
    };
    const processMultiStatements = objectStatements => {
        let nodes = [];
        let edges = [];
        objectStatements.forEach(obj => {
            for (const statement of obj.statements) {
                // limit the label length to 20 chars
                // remove duplicate nodes
                processSingleStatement(nodes, edges, statement);
            }
        });
        nodes = uniqBy(nodes, 'id');
        edges = uniqBy(edges, e => [e.from, e.to, e.label].join());
        setNodes(nodes);
        setEdges(edges);
        return { nodes, edges };
    };
    const processStatements = (statements, auxNode) => {
        let nodes = [];
        let edges = [];

        for (const statement of statements) {
            processSingleStatement(nodes, edges, statement);
        }
        // remove duplicate nodes
        nodes = uniqBy(nodes, 'id');
        edges = uniqBy(edges, e => [e.from, e.to, e.label].join());

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
            };
            const link = {
                source: nodes[0]?.id,
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
        setNodes(nodes);
        setEdges(edges);
        return { nodes, edges };
    };

    const getResourceAndStatements = async (resourceId, depth, list) => {
        // const d = setDepths(depth);
        // if (depth > d - 1) {
        //     return list;
        // }

        const statements = await getStatementsBySubject({ id: resourceId });

        if (statements.length > 0) {
            list.push(...statements);
            for (const statement of statements) {
                if (statement.object._class === 'resource') {
                    // eslint-disable-next-line no-await-in-loop
                    await getResourceAndStatements(statement.object.id, depth + 1, list);
                }
            }

            return list;
        }
        return list;
    };
    // useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // const getDataFromApi = async resourceId => {
    //     try {
    //         const statements = await getStatementsBySubject({ id: resourceId });

    //         if (statements.length === 0) {
    //             return {}; // we don't have incremental data
    //         }
    //         // result is the incremental data we get;
    //         console.log('statements by subject', statements);
    //         return processStatements(statements);
    //     } catch (error) {
    //         return {}; // TODO: handle unsaved resources
    //     }
    // };

    //     //  getDataFromApi(/* pass the resourceId here */);
    //     const fetchMultipleResourcesFromAPI = async resourceIds => {
    //         try {
    //             const objectStatements = await getStatementsBySubjects({ ids: resourceIds });
    //             if (objectStatements.length === 0) {
    //                 return {}; // we dont have incremental data
    //             }
    //             console.log('objectStatements', objectStatements);
    //             return processMultiStatements(objectStatements);
    //         } catch (error) {
    //             return {}; // TODO: handle unsaved resources
    //         }
    //     };
    //     //  fetchMultipleResourcesFromAPI();
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadStatements = useCallback(async () => {
        setIsLoadingStatements(true);

        if (paperId) {
            const statements = await getResourceAndStatements(paperId, 0, []);
            console.log('statements by resource and statements', statements);
            const auxiliaryMetaDataNode = true; // flag for using or not using auxiliary node for meta info
            const result = processStatements(statements, auxiliaryMetaDataNode);

            setNodes(result?.nodes);
            setEdges(result?.edges);
        }

        setIsLoadingStatements(false);
    }, [paperId]);

    useEffect(() => {
        if (isOpen) {
            // Perform actions when the modal is opened
            loadStatements();
        }
    }, [isOpen, loadStatements]);

    return (
        <Modal isOpen={isOpen} toggle={toggle} onOpened={loadStatements()}>
            <ModalHeader toggle={toggle}>{header}</ModalHeader>
            <ModalBody>
                {content}
                <h1>hello</h1>
            </ModalBody>
            <ModalFooter className="d-flex justify-content-center">
                <Button onClick={toggle} color="primary">
                    {isLoadingStatements}
                    {initializeGraph}

                    <ReGraph nodes={nodes} edges={edges} />
                </Button>
            </ModalFooter>
        </Modal>
    );
};

GraphViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    header: PropTypes.string.isRequired,
    paperId: PropTypes.string,
};

export default GraphViewModal;
