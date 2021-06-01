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
        // console.log('>>>> THIS SHALL BE CALLED CREATE RENDERING DATA FUNCTION');
        const sharedCustomizationState = this.selfVisModel.__sharedStateObject;
        const customizer = sharedCustomizationState.customizer;
        // console.log('Shared state:', sharedCustomizationState);
        const gdc = this.selfVisModel._googleChartsData;
        // ensure that is is correct every time;
        // console.log(gdc);

        if (gdc && this.props.visualizationMethod === 'Table') {
            return gdc.useAllColumns();
        } else {
            if (gdc && customizer.errorValue === -1 && customizer.xAxisSelector && customizer.yAxisSelector && customizer.yAxisSelector.length > 0) {
                // console.log('LEST CREATE THAT THING!!!!');
                const resultingData = gdc.createDataFromSharedCustomizer(customizer);
                if (resultingData.cols[0].type === 'date' && this.props.visualizationMethod === 'LineChart') {
                    // we need to sort the input data if date and if we have a line chart...
                    const sortedData = { ...resultingData };
                    sortedData.rows.sort((a, b) => a.c[0].v <= b.c[0].v);
                    return sortedData;
                }
                return resultingData;
            }
        }
    };

    render() {
        const renderingData = this.createRenderingData();
        let XLabel = '';
        let YLabel = '';
        const customizer = this.selfVisModel.__sharedStateObject.customizer;
        if (customizer) {
            XLabel = customizer.xAxisLabel ? customizer.xAxisLabel : customizer.xAxisSelector ? customizer.xAxisSelector.label : '';
            YLabel = customizer.yAxisLabel
                ? customizer.yAxisLabel
                : customizer.yAxisSelector && customizer.yAxisSelector[0]
                ? customizer.yAxisSelector[0].label
                : '';
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
