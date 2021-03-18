import React, { Component } from 'react';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import AbstractChartRenderer from './ChartRenderers/AbstractChartRenderer';
import PropTypes from 'prop-types';

export default class AbstractRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = { updateFlipFlop: false, requiresUpdate: false };
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.supportedVisualizationMethods = ['Table', 'BarChart', 'ColumnChart'];
        this.customizationState = undefined;
    }

    componentDidMount() {
        if (!this.selfVisModel._renderingMethod) {
            this.selfVisModel._renderingMethod = this.supportedVisualizationMethods[0];
            this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
        }
    }

    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        if (prevProps.isInputTableExpanded !== this.props.isInputTableExpanded) {
            // force an update;
            /** the chart widget does not have animation functions, so it will not know the width when animation is finished
             * so here we hack it with an timeout**/
            setTimeout(this.applySelectorMethod, 400);
        }
    };

    applySelectorMethod = () => {
        this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
    };

    setCustomizationState = state => {
        this.customizationState = state;
        this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
    };

    createVisualization = () => {
        // get the rendering method
        const renderingMethod = this.selfVisModel.getRenderingMethod();

        if (
            renderingMethod === 'ColumnChart' ||
            renderingMethod === 'Table' ||
            renderingMethod === 'BarChart' ||
            renderingMethod === 'ScatterChart' ||
            renderingMethod === 'LineChart'
        ) {
            return (
                <AbstractChartRenderer
                    visualizationMethod={renderingMethod}
                    visualizationWidth={this.props.visualizationWidth - 20}
                    visualizationHeight={this.props.visualizationHeight}
                    customizationState={this.customizationState}
                />
            );
        }
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div
                style={{
                    // backgroundColor: 'yellow',
                    width: this.props.visualizationWidth + 'px'
                }}
            >
                {this.createVisualization()}
            </div>
        );
    }
}

AbstractRenderer.propTypes = {
    isLoading: PropTypes.bool,
    isInputTableExpanded: PropTypes.bool,
    height: PropTypes.number,
    visualizationWidth: PropTypes.number,
    visualizationHeight: PropTypes.number
};
