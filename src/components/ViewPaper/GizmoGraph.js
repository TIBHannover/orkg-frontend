import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

class GizMOGraph extends Component {
    constructor(props) {
        super(props);
        this.graphRoot = undefined;
        this.graphVis = props.graphVis;

        // parent functions called by child
        this.updateDepthRange = props.updateDepthRange;

        // this object functions
        this.centerGraphEvent = this.centerGraphEvent.bind(this);
        this.clearGraphData = this.clearGraphData.bind(this);
        this.filterGraphByDepth = this.filterGraphByDepth.bind(this);
        this.propagateDepthMaxValue = this.propagateDepthMaxValue.bind(this);
    }

    componentDidMount() {
        // console.log('GizMOGraph component did mount ');

        if (this.props.initializeGraph && this.graphVis.graphInitialized() === false) {
            this.graphVis.bindComponentValues(this.props);
            this.graphVis.graphInitialized(true);
        }
        if (this.graphVis.graphInitialized()) {
            this.graphVis.redrawGraphWithReset(this.props);
        }
    }

    componentDidUpdate = prevProps => {
        let nonEqualItems = 0;
        let graphHasChanged = false;
        for (let name in prevProps) {
            if (prevProps.hasOwnProperty(name) && this.props.hasOwnProperty(name)) {
                const prevItem = prevProps[name];
                const newItem = this.props[name];
                if (newItem !== prevItem) {
                    nonEqualItems++;
                    if (name === 'graph') {
                        const graph = this.props[name];
                        graphHasChanged = true;
                        // verify that the nodes and edges of the graphVis are diffrent
                        if (this.graphVis.edges === graph.edges && this.graphVis.nodes === graph.nodes) {
                            graphHasChanged = false;
                        }
                    }
                }
            }
        }
        // if graph has changed, we reload its values
        if (this.props.addPaperVisualization && graphHasChanged === true) {
            this.graphVis.bindComponentValues(this.props);
        }

        if (nonEqualItems > 0) {
            if (!this.props.isLoadingStatements) {
                if (prevProps.layout !== this.props.layout) {
                    this.graphVis.updateLayout(this.props.layout);
                }
                const newDepthValue = parseInt(this.props.depth) + 1;
                this.graphVis.filterGraphByDepth(newDepthValue);
                // TODO could be optimized not to be called on reloading data from loading statements
                // console.log('called filterGraph by Depth' + newDepthValue);
            }
        }
    };

    componentWillUnmount() {
        // console.log('GizMO Graph un mounting');
        this.graphVis.stopBackgroundProcesses();

        if (this.graphVis.graphIsInitialized) {
            // todo : make sure memory is cleared!
            this.clearGraphData();
        }
    }

    propagateDepthMaxValue(maxValue) {
        if (maxValue < 0) {
            return;
        }
        if (this.props.depth > maxValue) {
            this.updateDepthRange(maxValue, true);
        }
    }

    filterGraphByDepth(depth) {
        const val = parseInt(depth) + 1; // make sure it is int and reflects the backend depth value;
        this.graphVis.filterGraphByDepth(val);
    }

    centerGraphEvent() {
        this.graphVis.zoomToExtent();
    }

    clearGraphData() {
        this.graphVis.svgRoot.remove();
    }

    /** Component Rendering Function **/
    render() {
        return <div id="graphRendering" style={{ width: '100%', height: '100%', backgroundColor: 'gray' }} />;
    }
}

/** Property Type Validation **/
GizMOGraph.propTypes = {
    updateDepthRange: PropTypes.func.isRequired,
    graph: PropTypes.any.isRequired,
    graphVis: PropTypes.any.isRequired,
    depth: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,
    isLoadingStatements: PropTypes.bool.isRequired,
    initializeGraph: PropTypes.bool.isRequired,
    addPaperVisualization: PropTypes.bool
};

export default GizMOGraph;
