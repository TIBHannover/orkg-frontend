import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

export default class GDCVisualizationRenderer extends Component {
    /** component rendering entrance point **/
    render() {
        return (
            <div>
                <Chart
                    chartType={this.props.model.data.visMethod}
                    data={this.props.model.data.googleChartsData}
                    // width={this.state.windowWidth - 20 + 'px'}
                    // height={this.state.windowHeight + 'px'}
                    options={{
                        showRowNumber: true,
                        width: '100%'
                    }}
                />
            </div>
        );
    }
}

GDCVisualizationRenderer.propTypes = {
    model: PropTypes.any
};
