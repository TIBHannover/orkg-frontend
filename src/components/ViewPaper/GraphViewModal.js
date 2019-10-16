import React, { Component } from 'react';
import { getStatementsBySubject } from '../../network';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Graph from 'react-graph-vis';
import { Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label } from 'reactstrap';
import uniqBy from 'lodash/uniqBy';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import 'vis-network/dist/vis-network.min.css';

class GraphView extends Component {
    state = {
        nodes: [],
        edges: [],
        statements: [],
        depth: 5,
        isLoadingStatements: false,
    };

    componentDidUpdate = (prevProps, prevState) => {
        // load statements again if depth is changed
        if (prevState.depth !== this.state.depth) {
            this.loadStatements();
        }
    };

    loadStatements = async () => {
        this.setState({ isLoadingStatements: true });
        if (this.props.paperId) {
            let statements = await this.getResourceAndStatements(this.props.paperId, 0, []);
            let nodes = [];
            let edges = [];

            for (let statement of statements) {
                // limit the label length to 20 chars
                const subjectLabel = statement.subject.label.substring(0, 20);
                const objectLabel = statement.object.label.substring(0, 20);

                nodes.push({ id: statement.subject.id, label: subjectLabel, title: statement.subject.label });
                nodes.push({ id: statement.object.id, label: objectLabel, title: statement.object.label });
                edges.push({ from: statement.subject.id, to: statement.object.id, label: statement.predicate.label });
            }

            // remove duplicate nodes
            nodes = uniqBy(nodes, 'id');

            this.setState({
                nodes,
                edges,
            });
        } else {
            this.visualizeAddPaper();
        }
        this.setState({ isLoadingStatements: false });
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
            for (let author of authors) {
                nodes.push({ id: author.label, label: author.label.substring(0, 20), title: author.label });
                edges.push({ from: 'title', to: author.label, label: 'has author' });
            }
        }

        //doi
        nodes.push({ id: 'doi', label: doi.substring(0, 20), title: doi });
        edges.push({ from: 'title', to: 'doi', label: 'has doi' });

        //publicationMonth
        nodes.push({ id: 'publicationMonth', label: publicationMonth, title: publicationMonth });
        edges.push({ from: 'title', to: 'publicationMonth', label: 'has publication month' });

        //publicationYear
        nodes.push({ id: 'publicationYear', label: publicationYear, title: publicationYear });
        edges.push({ from: 'title', to: 'publicationYear', label: 'has publication year' });

        //research field TODO: convert to readable label
        nodes.push({ id: 'researchField', label: selectedResearchField, title: selectedResearchField });
        edges.push({ from: 'title', to: 'researchField', label: 'has research field' });

        //contributions
        if (Object.keys(contributions['byId']).length) {
            for (let contributionId in contributions['byId']) {
                let contribution = contributions['byId'][contributionId];

                nodes.push({ id: contribution.resourceId, label: contribution.label, title: contribution.label });
                edges.push({ from: 'title', to: contribution.resourceId, label: 'has contribution' });

                //research problems
                for (let problem of contribution.researchProblems) {
                    nodes.push({ id: contribution.resourceId + problem.label, label: problem.label, title: problem.label });
                    edges.push({ from: contribution.resourceId, to: contribution.resourceId + problem.label, label: 'has research problem' });
                }

                //contribution statements
                let statements = this.addPaperStatementsToGraph(contribution.resourceId, [], []);
                nodes.push(...statements.nodes);
                edges.push(...statements.edges);
            }
        }

        //  ensure no nodes with duplicate IDs exist
        nodes = uniqBy(nodes, 'id');

        this.setState({
            nodes,
            edges,
        });
    };

    addPaperStatementsToGraph = (resourceId, nodes, edges) => {
        let statementBrowser = this.props.statementBrowser;
        let resource = statementBrowser.resources.byId[resourceId];

        if (resource.propertyIds.length > 0) {
            for (let propertyId of resource.propertyIds) {
                let property = statementBrowser.properties.byId[propertyId];

                if (property.valueIds.length > 0) {
                    for (let valueId of property.valueIds) {
                        let value = statementBrowser.values.byId[valueId];
                        let id = value.resourceId ? value.resourceId : valueId;

                        //add the node and relation
                        nodes.push({ id: id, label: value.label, title: value.label });
                        edges.push({ from: resourceId, to: id, label: property.label });
                        console.log(value);
                        if (value.type === 'object') {
                            this.addPaperStatementsToGraph(id, nodes, edges);
                        }
                    }
                }
            }
        }

        return {
            nodes,
            edges,
        };
    };

    handleDepthChange = (event) => {
        this.setState({ depth: event.target.value });
    };

    getResourceAndStatements = async (resourceId, depth, list) => {
        if (depth > this.state.depth - 1) {
            return list;
        }

        let statements = await getStatementsBySubject({ id: resourceId });

        if (statements.length > 0) {
            list.push(...statements);

            for (let statement of statements) {
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
        const graph = {
            nodes: this.state.nodes,
            edges: this.state.edges,
        };

        const options = {
            nodes: {
                color: '#80869B',
                font: {
                    color: '#fff',
                },
            },

            layout: {
                hierarchical: {
                    direction: 'LR',
                    sortMethod: 'directed',
                    levelSeparation: 300,
                },
            },
            physics: {
                hierarchicalRepulsion: {
                    nodeDistance: 140,
                },
                barnesHut: {
                    avoidOverlap: 1,
                },
            },
            edges: {
                color: '#000000',
                smooth: false,
            },
            height: '700px',
        };

        /*const events = {
            select: function (event) {
                var { nodes, edges } = event;
            }
        };*/
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle} size="lg" onOpened={this.loadStatements} style={{ maxWidth: '90%' }}>
                <ModalHeader toggle={this.props.toggle}>Paper graph visualization</ModalHeader>
                <ModalBody>
                    {this.props.paperId && (
                        <Form>
                            <FormGroup className="d-flex" style={{ marginBottom: -40, position: 'absolute', zIndex: '999' }}>
                                <Label for="depth" className="align-self-center mb-0 mr-2">
                                    Depth
                                </Label>
                                <Input type="number" name="select" id="depth" onChange={this.handleDepthChange} value={this.state.depth} style={{ width: 60 }} min="1" max="25" />
                            </FormGroup>
                        </Form>
                    )}
                    {!this.state.isLoadingStatements && (
                        <Graph
                            graph={graph}
                            options={options}
                        //events={events}
                        />
                    )}
                    {this.state.isLoadingStatements && (
                        <div className="text-center text-primary mt-4 mb-4">
                            <span style={{ fontSize: 80 }}>
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
};

const mapStateToProps = (state) => ({
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser,
});

export default connect(mapStateToProps)(GraphView);
