import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

import { Chart } from 'react-google-charts';
import SelfVisDataMode from '../../SelfVisDataModel';
class AbstractChartRenderer extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.state = {
            fakeControls: []
        };
    }

    componentDidMount() {}

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.visualizationWidth !== this.props.visualizationWidth || prevProps.visualizationHeight !== this.props.visualizationHeight) {
            this.setState({ fakeControls: [] });
        }
    };

    createRenderingData = () => {
        // we have now some data here;
        // create a rendering data for this visualization;
        const gdc = this.selfVisModel._googleChartsData;
        if (gdc && this.props.customizationState && this.props.customizationState.xAxis && this.props.customizationState.yAxis.length !== 0) {
            const resultingData = gdc.createDataFromXYSelectors(this.props.customizationState.xAxis, this.props.customizationState.yAxis);

            if (resultingData.cols[0].type === 'date' && this.props.visualizationMethod === 'LineChart') {
                // we need to sort the input data if date and if we have a line chart...

                return resultingData.rows.sort((a, b) => a.c[0].v <= b.c[0].v);
            }

            return resultingData;
        }
    };

    render() {
        const renderingData = this.createRenderingData();
        return (
            <div style={{ padding: '10px' }}>
                {renderingData ? (
                    <Chart
                        controls={this.state.fakeControls}
                        chartType={this.props.visualizationMethod}
                        data={renderingData}
                        width="100%"
                        height={this.props.visualizationHeight - 10}
                        options={{ showRowNumber: true }}
                    />
                ) : (
                    <div>No Rendering Data Yet</div>
                )}
            </div>
        );
    }
}
AbstractChartRenderer.propTypes = {
    customizationState: PropTypes.object,
    visualizationWidth: PropTypes.number,
    visualizationHeight: PropTypes.number,
    visualizationMethod: PropTypes.string
};
export default AbstractChartRenderer;
