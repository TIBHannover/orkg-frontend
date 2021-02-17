import React, { Component } from 'react';
import { Chart } from 'react-google-charts';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';

class AbstractChartRenderer extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.state = {
            fakeControls: [] // used to trigger an update event on the chart rendering engine
        };
    }

    componentDidUpdate = prevProps => {
        if (prevProps.visualizationWidth !== this.props.visualizationWidth || prevProps.visualizationHeight !== this.props.visualizationHeight) {
            this.setState({ fakeControls: [] });
        }
    };

    createRenderingData = () => {
        const gdc = this.selfVisModel._googleChartsData;

        if (gdc && this.props.visualizationMethod === 'Table') {
            return gdc.useAllColumns();
        }

        if (gdc && this.props.customizationState && this.props.customizationState.xAxis && this.props.customizationState.yAxis.length !== 0) {
            const resultingData = gdc.createDataFromSelectors(this.props.customizationState);
            if (resultingData.cols[0].type === 'date' && this.props.visualizationMethod === 'LineChart') {
                // we need to sort the input data if date and if we have a line chart...
                const sortedData = { ...resultingData };
                sortedData.rows.sort((a, b) => a.c[0].v <= b.c[0].v);
                return sortedData;
            }
            return resultingData;
        }
    };

    render() {
        const renderingData = this.createRenderingData();
        let XLabel = '';
        let YLabel = '';

        if (this.props.customizationState) {
            if (this.props.customizationState.xAxisLabel === undefined) {
                XLabel = this.props.customizationState.xAxis;
            } else {
                XLabel = this.props.customizationState.xAxisLabel;
            }

            if (this.props.customizationState.yAxisLabel === undefined) {
                YLabel = this.props.customizationState.yAxis[0];
            } else {
                YLabel = this.props.customizationState.yAxisLabel;
            }
        }
        // addLabels to charts
        return (
            <div style={{ padding: '10px' }}>
                {renderingData ? (
                    <Chart
                        controls={this.state.fakeControls}
                        chartType={this.props.visualizationMethod}
                        data={renderingData}
                        width="100%"
                        height={this.props.visualizationHeight - 10}
                        options={{
                            showRowNumber: true,
                            hAxis: {
                                title: this.props.visualizationMethod === 'BarChart' ? YLabel : XLabel
                            },
                            vAxis: {
                                title: this.props.visualizationMethod === 'BarChart' ? XLabel : YLabel
                            }
                        }}
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
