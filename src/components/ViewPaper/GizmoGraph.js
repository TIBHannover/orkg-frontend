import React, {Component} from 'react';
import * as d3 from 'd3';
import GraphVis from './graphImpl/GraphVis';
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
        console.log('component did mount !');
        if (!this.state.isLoadingStatements && this.updateDepthRange) {
            // add an svg component
            // check if there is data;
            console.log(this.state.nodes);
            console.log(this.state.edges);

            if (this.state.nodes.length > 0) {

                console.log('we have data and should be able to do what we want!');
                this.graphRoot = d3.select('#graphRendering').append('svg');
                this.initializeGraphSize();
            }
        }
    };

    componentDidUpdate = (prevProps, prevState) => {

        if (prevProps === this.props) {
            console.log('Ignore props update');
        } else {
            console.log('Something has changed , update GraphVis');
            if (prevProps.layout !== this.props.layout) {
                console.log('Want to update the layout to ' + this.props.layout);
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
        const val = parseInt(depth) + 1;
        console.log(' Child : Taking care of it');
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

            console.log('number of nodes = ' + this.state.nodes.length);


            this.graphVis.loadData();

            this.maxDepth = this.graphVis.getMaxDepth() - 1;
            console.log('The graph MaxDepth is ' + this.maxDepth);
            console.log('we look at data:' + this.state.depth);

            if (this.state.depth > this.maxDepth) {
                this.updateDepthRange(this.maxDepth, true);
            }
            this.graphInitialized = true;
        }

    }


    render() {
        return (
            <div id="graphRendering" style={{width: '100%', height: '100%', backgroundColor: 'gray'}} />
        );
    }

}

GizMOGraph.propTypes = {
    updateDepthRange: PropTypes.func.isRequired,
    graph: PropTypes.any.isRequired,
    depth: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired
    // updateDepthRange: PropTypes.array.isRequired,
};
export default GizMOGraph;
