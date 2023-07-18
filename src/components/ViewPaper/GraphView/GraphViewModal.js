import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import uniqBy from 'lodash/uniqBy';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
    faProjectDiagram,
    faHome,
    faSitemap,
    faExpandArrowsAlt,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faSpinner,
    faDharmachakra,
} from '@fortawesome/free-solid-svg-icons';
import literal from '../../../assets/img/graphIcons/literals.svg';
import ReGraph from './ReaGraph';

const GraphViewModal = props => {
    const graphRef = useRef();
    const { isOpen, toggle, paperId } = props;
    const [layoutType, setLayoutType] = useState('forceDirected2d');
    const [layoutSelectionOpen, setLayoutSelectionOpen] = useState(false);
    const [nodesz, setNodes] = useState([]);
    const [edgesz, setEdges] = useState([]);
    const [windowHeight, setWindowHeight] = useState(0);
    const [isLoadingStatements, setIsLoadingStatements] = useState(false);

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
    function generateAutoID() {
        // generate random number
        const randomNum = Math.random();
        return `${randomNum}`;
    }
    const constructEachTriple = (nodes, edges, statement) => {
        const subjectLabel = statement.subject.label.substring(0, 20);
        const objectLabel = statement.object.label.substring(0, 20);

        nodes.push({
            id: statement.subject.id,
            label: subjectLabel,
            title: statement.subject.label,
            classificationArray: statement.subject.classes,
            fill: 'brown',
        });

        // check if node type is resource or literal
        if (statement.object._class === 'resource') {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
                fill: '#1E90FF',
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
                icon: literal,
            });
        }
        const autoID = generateAutoID();
        if (statement.predicate.id === 'P27') {
            // add user Icon to target node if we have 'has author' property === P27

            edges.push({
                id: statement.predicate.id + autoID,
                source: statement.subject.id,
                target: statement.object.id,
                label: statement.predicate.label,
                isAuthorProp: true,
                size: 5,
            });
        } else if (statement.predicate.id === 'P26') {
            // add DOI Icon to target node
            edges.push({
                id: statement.predicate.id + autoID,
                source: statement.subject.id,
                target: statement.object.id,
                label: statement.predicate.label,
                isDOIProp: false,
                size: 5,
            }); // remove doi icon for now
        } else {
            // no Icon for the target node
            edges.push({
                id: statement.predicate.id + autoID,
                source: statement.subject.id,
                target: statement.object.id,
                label: statement.predicate.label,
                size: 5,
            });
        }
    };
    const processStatements = (statementss, auxNode) => {
        let nodes = [];
        let edges = [];

        for (const statement of statementss) {
            constructEachTriple(nodes, edges, statement);
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
                        edge.id === PREDICATES.URL ||
                        edge.id === PREDICATES.HAS_ORCID
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
            const statements = await getStatementsBundleBySubject({ id: paperId, maxLevel: 10 });

            if (statements.statements.length === 0) {
                return {}; // we don't have incremental data
            }

            setTimeout(() => {
                // Load the statements here
                // Set the loading state to false after loading the statements
                setIsLoadingStatements(false);
            }, 1000);
            const auxiliaryMetaDataNode = true; // flag for using or not using auxiliary node for meta info
            const result = processStatements(statements.statements, auxiliaryMetaDataNode);
            setNodes(result?.nodes);
            setEdges(result?.edges);
        }
    };

    useEffect(() => {
        setIsLoadingStatements(true);
        fetchData();
    }, [isOpen, paperId]);

    const handleLayoutChange = newLayoutType => {
        setLayoutType(newLayoutType);
    };
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
                <div className="d-flex" style={{ height: '40px' }}>
                    <div style={{ width: '600px', height: '40px', paddingTop: '5px' }}>Paper graph visualization</div>
                    <div style={{ width: '100%', display: 'flex' }}>
                        {' '}
                        <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1' }}>
                            <Button
                                color="secondary"
                                size="sm"
                                //    className='mb-4 mt-4'
                                style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '155px' }}
                                // onClick={exploreTheFullGraph}
                                // disabled={exploringFullGraph}
                            >
                                {/* {!exploringFullGraph ? ( */}
                                <>
                                    <Icon icon={faExpandArrowsAlt} className="me-1 align-self-center" />
                                    Expand all nodes{' '}
                                </>
                                {/* ) : (
                                    <>
                                        <Icon icon={faSpinner} spin className="me-1 align-self-center" /> Expanding graph
                                    </>
                                )} */}
                            </Button>
                            <Button
                                color="secondary"
                                size="sm"
                                style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '130px' }}
                                onClick={() => graphRef.current?.centerGraph()}
                            >
                                <Icon icon={faHome} className="me-1 align-self-center" /> Center graph
                            </Button>
                            <Button
                                color="secondary"
                                size="sm"
                                style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '130px' }}
                                onClick={() => graphRef.current?.zoomIn()}
                            >
                                <Icon icon={faMagnifyingGlassPlus} className="me-1 align-self-center" /> Zoom In
                            </Button>
                            <Button
                                color="secondary"
                                size="sm"
                                style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '130px' }}
                                onClick={() => graphRef.current?.zoomOut()}
                            >
                                <Icon icon={faMagnifyingGlassMinus} className="me-1 align-self-center" /> Zoom Out
                            </Button>
                            <Dropdown
                                color="secondary"
                                size="sm"
                                style={{
                                    marginLeft: '10px',
                                    flexGrow: '1',
                                    display: 'flex',
                                    height: 'min-content',
                                    paddingTop: '5px',
                                }}
                                isOpen={layoutSelectionOpen}
                                toggle={() => {
                                    setLayoutSelectionOpen(!layoutSelectionOpen);
                                }}
                            >
                                <DropdownToggle caret color="secondary">
                                    Layout:
                                    <Icon
                                        icon={
                                            layoutType === 'forceDirected2d'
                                                ? faProjectDiagram
                                                : layoutType === 'radialOut2d'
                                                ? faDharmachakra
                                                : layoutType === 'circular2d'
                                                ? faSpinner
                                                : faSitemap
                                        }
                                        rotation={layoutType === 'treeLr2d' ? 270 : undefined}
                                        className="me-1"
                                        style={{ width: '40px' }}
                                    />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => handleLayoutChange('forceDirected2d')}>
                                        <Icon icon={faProjectDiagram} className="me-1" style={{ width: '40px' }} />
                                        Force directed
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleLayoutChange('treeLr2d')}>
                                        <Icon icon={faSitemap} rotation={270} className="me-1" style={{ width: '40px' }} />
                                        Horizontal tree
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleLayoutChange('treeTd2d')}>
                                        <Icon icon={faSitemap} className="me-1" style={{ width: '40px' }} />
                                        Vertical tree
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleLayoutChange('radialOut2d')}>
                                        <Icon icon={faDharmachakra} className="me-1" style={{ width: '40px' }} />
                                        RadialOut
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleLayoutChange('circular2d')}>
                                        <Icon icon={faSpinner} className="me-1" style={{ width: '40px' }} />
                                        Circular
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '0', minHeight: '100px', height: windowHeight }}>
                <ReGraph nodesz={nodesz} edgesz={edgesz} layoutType={layoutType} graphRef={graphRef} />
                {isLoadingStatements && (
                    <div className="text-center text-primary mt-4 mb-4">
                        {/* using a manual fixed scale value for the spinner scale! */}
                        <span style={{ fontSize: windowHeight / 5 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading graph...</h2>
                    </div>
                )}
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
