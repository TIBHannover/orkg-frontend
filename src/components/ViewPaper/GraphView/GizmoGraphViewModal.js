import React, { Component } from 'react';
import { getStatementsBySubject } from '../../../network';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
// import Graph from 'react-graph-vis';
import GizmoGraph from './GizmoGraph';
import { Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label, Button } from 'reactstrap';
import uniqBy from 'lodash/uniqBy';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faProjectDiagram, faAngleDoubleLeft, faAngleDoubleUp, faHome } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// moving GraphVis here in order to maintain the layouts and status related stuff;
import GraphVis from '../../../libs/gizmo/GraphVis';

class GraphView extends Component {
    constructor(props) {
        super(props);

        this.child = React.createRef();
        this.seenDepth = -1;
        this.graphVis = new GraphVis();
        this.updateDepthRange = this.updateDepthRange.bind(this);
    }

    state = {
        nodes: [],
        edges: [],
        statements: [],
        depth: 1,
        initializeGraph: false,
        seenDepth: -1,
        isLoadingStatements: false,
        maxDepth: 25,
        seenFullGraph: false,
        layoutSelectionOpen: false,
        layout: 'force',
        windowHeight: 0 // want this for auto aligning the size of the modal window
    };

    componentDidMount() {
        console.log('Graph View Modal is mounted');
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.addPaperVisualization === true) {
            if (prevProps.showDialog === false && this.props.showDialog === true) {
                // reload graph data when modal is shown
                this.visualizeAddPaper();
            }
        }
        // load statements again if depth is changed
        if (prevState.depth < this.state.depth) {
            this.loadStatements().then(() => {
                // todo remove code duplication >> create function for that
                if (this.child && this.child.current) {
                    this.child.current.propagateDepthMaxValue(this.graphVis.getMaxDepth());
                    this.graphVis.ensureLayoutConsistency(this.state.layout);
                }
                this.seenDepth = this.graphVis.getMaxDepth();
            });
        }
    };

    componentWillUnmount() {
        console.log('View modal un mounting');
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDepthRange(value, fullGraph) {
        // called from the child to ensure that the depth has correct range
        if (fullGraph) {
            this.setState({ maxDepth: value, depth: value, seenFullGraph: true });
            return;
        }
        if (value < this.state.depth || this.state.seenFullGraph === true) {
            // Case we have seen the full Graph so we just update the graph view
            this.setState({ depth: value });
        } else {
            if (!fullGraph && this.state.seenFullGraph === false) {
                //Case we want to load more data
                this.setState({ depth: value, seenFullGraph: false });
            } else {
                //Case we have seen the full Graph on going deeper
                this.setState({ maxDepth: value, seenFullGraph: true });
            }
        }
    }

    loadStatements = async () => {
        this.setState({ isLoadingStatements: true, initializeGraph: false });
        this.graphVis.stopBackgroundProcesses();
        if (this.seenDepth < this.state.depth) {
            if (this.props.paperId) {
                const statements = await this.getResourceAndStatements(this.props.paperId, 0, []);
                let nodes = [];
                let edges = [];

                for (const statement of statements) {
                    // limit the label length to 20 chars
                    const subjectLabel = statement.subject.label.substring(0, 20);
                    const objectLabel = statement.object.label.substring(0, 20);

                    nodes.push({ id: statement.subject.id, label: subjectLabel, title: statement.subject.label });
                    // check if node type is resource or literal
                    if (statement.object._class === 'resource') {
                        nodes.push({ id: statement.object.id, label: objectLabel, title: statement.object.label });
                    } else {
                        nodes.push({
                            id: statement.object.id,
                            label: objectLabel,
                            title: statement.object.label,
                            type: 'literal'
                        });
                    }
                    edges.push({ from: statement.subject.id, to: statement.object.id, label: statement.predicate.label });
                }
                // remove duplicate nodes
                nodes = uniqBy(nodes, 'id');

                // remove duplicate edges TODO: EXPERIMENTAL
                edges = uniqBy(edges, e => [e.from, e.to, e.label].join());

                this.setState({
                    nodes,
                    edges
                });
            } else {
                await this.visualizeAddPaper();
            }
        }
        this.setState({ isLoadingStatements: false, initializeGraph: true });
    };

    // Code is not very organized, structure can be improved
    visualizeAddPaper = () => {
        let nodes = [];
        let edges = [];
        const { title, authors, doi, publicationMonth, publicationYear, selectedResearchField, contributions } = this.props.addPaper;

        // title
        nodes.push({ id: 'title', label: title.substring(0, 20), title: title });

        // authors
        if (authors.length > 0) {
            for (const author of authors) {
                nodes.push({ id: author.label, label: author.label.substring(0, 20), title: author.label });
                edges.push({ from: 'title', to: author.label, label: 'has author' });
            }
        }

        //doi
        nodes.push({ id: 'doi', label: doi.substring(0, 20), title: doi, type: 'literal' });
        edges.push({ from: 'title', to: 'doi', label: 'has doi' });

        //publicationMonth
        nodes.push({ id: 'publicationMonth', label: publicationMonth, title: publicationMonth, type: 'literal' });
        edges.push({ from: 'title', to: 'publicationMonth', label: 'has publication month' });

        //publicationYear
        nodes.push({ id: 'publicationYear', label: publicationYear, title: publicationYear, type: 'literal' });
        edges.push({ from: 'title', to: 'publicationYear', label: 'has publication year' });

        //research field TODO: convert to readable label
        nodes.push({ id: 'researchField', label: selectedResearchField, title: selectedResearchField });
        edges.push({ from: 'title', to: 'researchField', label: 'has research field' });

        //contributions
        if (Object.keys(contributions['byId']).length) {
            for (const contributionId in contributions['byId']) {
                if (contributions['byId'].hasOwnProperty(contributionId)) {
                    const contribution = contributions['byId'][contributionId];

                    nodes.push({ id: contribution.resourceId, label: contribution.label, title: contribution.label });
                    edges.push({ from: 'title', to: contribution.resourceId, label: 'has contribution' });

                    //research problems
                    for (const problem of contribution.researchProblems) {
                        nodes.push({
                            id: contribution.resourceId + problem.label,
                            label: problem.label,
                            title: problem.label
                        });
                        edges.push({
                            from: contribution.resourceId,
                            to: contribution.resourceId + problem.label,
                            label: 'has research problem'
                        });
                    }

                    //contribution statements
                    const statements = this.addPaperStatementsToGraph(contribution.resourceId, [], []);
                    nodes.push(...statements.nodes);
                    edges.push(...statements.edges);
                }
            }
        }

        //  ensure no nodes with duplicate IDs exist
        nodes = uniqBy(nodes, 'id');
        edges = uniqBy(edges, e => [e.from, e.to, e.label].join());

        this.setState({
            nodes,
            edges
        });
    };

    addPaperStatementsToGraph = (resourceId, nodes, edges) => {
        // we could try to add depth values here the nodes
        //
        // then when the depth value changed, higher than seen value
        // select all nodes that have this value and only query these ones
        // >> faster performance since only retrieving what is needed !

        const statementBrowser = this.props.statementBrowser;
        const resource = statementBrowser.resources.byId[resourceId];

        if (resource.propertyIds.length > 0) {
            for (const propertyId of resource.propertyIds) {
                const property = statementBrowser.properties.byId[propertyId];

                if (property.valueIds.length > 0) {
                    for (const valueId of property.valueIds) {
                        const value = statementBrowser.values.byId[valueId];
                        const id = value.resourceId ? value.resourceId : valueId;

                        //add the node and relation
                        nodes.push({ id: id, label: value.label, title: value.label });
                        edges.push({ from: resourceId, to: id, label: property.label });
                        if (value.type === 'object') {
                            this.addPaperStatementsToGraph(id, nodes, edges);
                        }
                    }
                }
            }
        }

        return {
            nodes,
            edges
        };
    };

    centerGraph = () => {
        this.child.current.centerGraphEvent();
    };

    // not used anymore, stays for mem leak analysis (todo)
    clearGraphData = () => {
        this.child.current.clearGraphData();
    };

    getLayoutIcon() {
        if (this.state.layout === 'force') {
            return faProjectDiagram;
        }
        if (this.state.layout === 'treeH') {
            return faAngleDoubleLeft;
        }
        if (this.state.layout === 'treeV') {
            return faAngleDoubleUp;
        }
    }

    updateDimensions = () => {
        // test
        const offset = 28 * 2 + 65;
        this.setState({ windowHeight: window.innerHeight - offset });
    };

    handleDepthChange = event => {
        if (event.target.value) {
            this.setState({ depth: parseInt(event.target.value) });
        } // make sure the value is an integer
    };

    getResourceAndStatements = async (resourceId, depth, list) => {
        if (depth > this.state.depth - 1) {
            return list;
        }

        const statements = await getStatementsBySubject({ id: resourceId });

        if (statements.length > 0) {
            list.push(...statements);
            for (const statement of statements) {
                if (statement.object._class === 'resource') {
                    await this.getResourceAndStatements(statement.object.id, depth + 1, list);
                }
            }

            return list;
        } else {
            return list;
        }
    };

    render() {
        /*const events = {
            select: function (event) {
                var { nodes, edges } = event;
            }
        };*/
        return (
            <Modal
                isOpen={this.props.showDialog}
                toggle={this.props.toggle}
                size="lg"
                onOpened={() => {
                    this.loadStatements().then(() => {
                        if (this.child && this.child.current) {
                            this.child.current.propagateDepthMaxValue(this.graphVis.getMaxDepth());
                            this.graphVis.ensureLayoutConsistency(this.state.layout);
                        }
                        this.seenDepth = this.graphVis.getMaxDepth();
                    });
                }}
                style={{ maxWidth: '90%' }}
            >
                <ModalHeader toggle={this.props.toggle}>
                    <div className={'d-flex'}>
                        Paper graph visualization
                        <>
                            {' '}
                            {this.props.paperId && (
                                <Form inline className="ml-4">
                                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                        <Label for="depth" className="mb-0 mr-2">
                                            Depth
                                        </Label>
                                        <Input
                                            type="number"
                                            name="select"
                                            id="depth"
                                            bsSize="sm"
                                            onChange={this.handleDepthChange}
                                            onKeyDown={event => {
                                                // prevent the reload when enter is pressed
                                                if (event.keyCode === 13) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            value={this.state.depth}
                                            style={{ width: '60px' }}
                                            min="1"
                                            max={this.state.maxDepth}
                                        />
                                    </FormGroup>
                                </Form>
                            )}
                            <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1' }}>
                                <Button
                                    color="darkblue"
                                    size="sm"
                                    //    className='mb-4 mt-4'
                                    style={{ margin: '0 10px', flexGrow: '1', display: 'flex' }}
                                    onClick={this.centerGraph}
                                >
                                    <Icon icon={faHome} className="mr-1 align-self-center" /> Center Graph
                                </Button>

                                {/*/!*<Button*!/*/}
                                {/*/!*  color='darkblue'*!/*/}
                                {/*/!*  size='sm'*!/*/}
                                {/*/!*  //    className='mb-4 mt-4'*!/*/}
                                {/*/!*  // style={{position:'absolute', left: '450px', marginLeft: '10px'}}*!/*/}
                                {/*/!*  style={{margin: '0 10px'}}*!/*/}
                                {/*/!*  onClick={this.clearGraphData}*!/*/}
                                {/*/!*>*!/*/}
                                {/*  <Icon icon={faProjectDiagram} className='mr-1'/> Clear Data*/}
                                {/*</Button>*/}
                                <Dropdown
                                    color="darkblue"
                                    size="sm"
                                    //    className='mb-4 mt-4'
                                    style={{ margin: '0 10px', flexGrow: '1', display: 'flex' }}
                                    isOpen={this.state.layoutSelectionOpen}
                                    toggle={() => {
                                        this.setState({ layoutSelectionOpen: !this.state.layoutSelectionOpen });
                                    }}
                                >
                                    <DropdownToggle caret color="darkblue">
                                        Layout:
                                        <Icon icon={this.getLayoutIcon()} className="mr-1" style={{ width: '40px' }} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem
                                            onClick={() => {
                                                if (this.state.layout === 'force') {
                                                    return;
                                                }
                                                this.setState({ layout: 'force' });
                                            }}
                                        >
                                            <Icon icon={faProjectDiagram} className="mr-1" style={{ width: '40px' }} />
                                            Force Directed
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => {
                                                if (this.state.layout === 'treeH') {
                                                    // forcing reset of the layout
                                                    this.graphVis.updateLayout('treeH');
                                                    return;
                                                }
                                                this.setState({ layout: 'treeH' });
                                            }}
                                        >
                                            <Icon icon={faAngleDoubleLeft} className="mr-1" style={{ width: '40px' }} />
                                            Horizontal Tree
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => {
                                                if (this.state.layout === 'treeV') {
                                                    // forcing reset of the layout
                                                    this.graphVis.updateLayout('treeV');
                                                    return;
                                                }
                                                this.setState({ layout: 'treeV' });
                                            }}
                                        >
                                            <Icon icon={faAngleDoubleUp} className="mr-1" style={{ width: '40px' }} />
                                            Vertical Tree
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </>
                    </div>
                </ModalHeader>
                <ModalBody style={{ padding: '0', minHeight: '100px', height: this.state.windowHeight }}>
                    {!this.state.isLoadingStatements && (
                        <GizmoGraph
                            ref={this.child}
                            isLoadingStatements={this.state.isLoadingStatements}
                            depth={this.state.depth}
                            updateDepthRange={this.updateDepthRange}
                            maxDepth={this.state.maxDepth}
                            layout={this.state.layout}
                            graph={{ nodes: this.state.nodes, edges: this.state.edges }}
                            initializeGraph={this.state.initializeGraph}
                            graphVis={this.graphVis}
                            graphBgColor={'#ecf0f1'}
                            addPaperVisualization={this.props.addPaperVisualization}
                        />
                    )}
                    {this.state.isLoadingStatements && (
                        <div className="text-center text-primary mt-4 mb-4">
                            {/*using a manual fixed scale value for the spinner scale! */}
                            <span style={{ fontSize: this.state.windowHeight / 5 }}>
                                <Icon icon={faSpinner} spin />
                            </span>
                            <br />
                            <h2 className="h5">Loading graph...</h2>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

GraphView.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addPaper: PropTypes.object.isRequired,
    statementBrowser: PropTypes.object.isRequired,
    paperId: PropTypes.string,
    addPaperVisualization: PropTypes.bool,
    paperObject: PropTypes.object
};

const mapStateToProps = state => ({
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser
});

export default connect(mapStateToProps)(GraphView);
