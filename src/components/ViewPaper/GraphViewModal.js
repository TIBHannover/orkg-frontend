import React, { Component } from 'react';
import { getStatementsBySubject } from '../../network';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetStatementBrowser } from '../../actions/statementBrowser';
import Graph from 'react-graph-vis';
import { Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label } from 'reactstrap';
import uniqBy from 'lodash/uniqBy';
import 'vis/dist/vis-network.min.css';

class GraphView extends Component {

    state = {
        nodes: [],
        edges: [],
        statements: [],
        depth: 5,
    }

    componentDidUpdate = (prevProps, prevState) => {
        // load statements again if depth is changed
        if (prevState.depth !== this.state.depth) {
            this.loadStatements();
        }
    }

    loadStatements = async () => {
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
        })
    }

    handleDepthChange = (event) => {
        this.setState({ depth: event.target.value });
    };

    getResourceAndStatements = async (resourceId, depth, list) => {
        if (depth > this.state.depth - 1) {
            return list;
        }

        let statements = await getStatementsBySubject(resourceId);

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
    }

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
                }
            },

            layout: {
                hierarchical: {
                    direction: 'LR',
                    sortMethod: 'directed',
                    levelSeparation: 300
                }
            },
            physics: {
                hierarchicalRepulsion: {
                    nodeDistance: 140
                },
                barnesHut: {
                    avoidOverlap: 1
                },
            },
            edges: {
                color: '#000000',
                smooth: false
            },
            height: '700px'
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
                    <Form>
                        <FormGroup className="d-flex" style={{marginBottom: -40, position: 'absolute', zIndex: '999'}}>
                            <Label for="depth" className="align-self-center mb-0 mr-2">Depth</Label>
                            <Input type="number" name="select" id="depth" onChange={this.handleDepthChange} value={this.state.depth} style={{width: 60}} />
                        </FormGroup>
                    </Form>

                    <Graph
                        graph={graph}
                        options={options}
                        //events={events}
                    />
                </ModalBody>
            </Modal>
        );
    }
}

GraphView.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: () => dispatch(resetStatementBrowser()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GraphView);
