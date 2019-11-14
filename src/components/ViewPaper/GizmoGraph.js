import React, {Component} from 'react';
import GraphVis from './graphImpl/GraphVis';
import * as d3 from 'd3';
import * as PropTypes from 'prop-types';


class GizMOGraph extends Component {

    constructor(props) {
        super(props);
        this.graphRoot = undefined;
        this.graphVis = null;
        this.graphInitialized = false;
        // parent functions called by child
        this.updateDepthRange = props.updateDepthRange;

        this.centerGraphEvent = this.centerGraphEvent.bind(this);
        this.clearGraphData = this.clearGraphData.bind(this);
        this.getMaxDepth = this.getMaxDepth.bind(this);
        this.filterGraphByDepth = this.filterGraphByDepth.bind(this);
    }

    state = {
        nodes: this.props.graph.nodes,
        edges: this.props.graph.edges,
        statements: [],
        depth: this.props.depth,
        isLoadingStatements: false,
        graphBgColor: '#ecf0f1'

    };

    componentDidMount = () => {
        if (!this.state.isLoadingStatements && this.updateDepthRange) {
            // check if there is data;
            if (this.state.nodes.length > 0) {
                this.graphRoot = d3.select('#graphRendering').append('svg');
                this.initializeGraphSize();
            }
        }
    };

    componentDidUpdate = (prevProps) => {
        if (prevProps !== this.props) {
            if (prevProps.layout !== this.props.layout) {
                this.graphVis.updateLayout(this.props.layout);
            }
        }
    };

    componentWillUnmount() {
        if (this.graphInitialized) {
            this.clearGraphData();
            delete this.graphVis;
        }
    };

    filterGraphByDepth(depth) {
        const val = parseInt(depth) + 1; // make sure it is int and reflects the backend depth value;
        this.graphVis.filterGraphByDepth(val);
    }

    getMaxDepth() {
        return this.graphVis.getMaxDetph() - 1;
    }

    centerGraphEvent() {
        this.graphVis.zoomToExtent();
    };

    clearGraphData() {
        this.graphVis.clearGraphData();
    };

    initializeGraphSize() {
        this.graphRoot.style('width', '100%');
        this.graphRoot.style('height', '100%');
        this.graphRoot.style('background-color', this.state.graphBgColor);

        if (!this.state.isLoadingStatements) {
            this.initGraph();
        }
    }

    initGraph() {
        if (this.state.nodes.length > 0) {
            this.graphVis = new GraphVis({
                graphRoot: this.graphRoot,
                nodes: this.state.nodes,
                edges: this.state.edges,
                layout: this.props.layout
            });
            this.graphVis.loadDefaultOptions(); // keep it here in order to make later adjustments easier :)
            this.graphVis.initializeLayers();
            this.graphVis.initializeRendering();

            this.graphVis.loadData();
            this.maxDepth = this.graphVis.getMaxDepth() - 1;
            if (this.state.depth > this.maxDepth) {
                this.updateDepthRange(this.maxDepth, true);
            }
            this.graphInitialized = true;
        }
    }

    /** Component Rendering Function **/
    render() {
        return (
            <div id="graphRendering" style={{width: '100%', height: '100%', backgroundColor: 'gray'}} />
        );
    }

}

/** Property Type Validation **/
GizMOGraph.propTypes = {
    updateDepthRange: PropTypes.func.isRequired,
    graph: PropTypes.any.isRequired,
    depth: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired
    // updateDepthRange: PropTypes.array.isRequired,
};

export default GizMOGraph;
