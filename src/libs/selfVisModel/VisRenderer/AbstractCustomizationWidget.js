import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';
import CustomizationColumnChart from './ChartRenderers/CustomizationColumnChart';
import CustomizationBarChart from './ChartRenderers/CustomizationBarChart';
import CustomizationScatterChart from './ChartRenderers/CustomizationScatterChart';
import CustomizationLineChart from './ChartRenderers/CustomizationLineChart';
import CustomizationPieChart from './ChartRenderers/CustomizationPieChart';

export default class AbstractCustomizationWidget extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.state = { updateFlipFlop: false, requiresUpdate: false };
    }

    createCustomizationWidget = () => {
        // get the rendering method
        const renderingMethod = this.selfVisModel.getRenderingMethod();
        if (!renderingMethod) {
            this.selfVisModel.setRenderingMethod('Table');
        }
        const keepCustomizationWidgetWhenChanged = true;

        switch (renderingMethod) {
            case 'Table': {
                return (
                    <Alert color="secondary" fade={false}>
                        Tables can't be customized
                    </Alert>
                );
            }
            case 'ColumnChart': {
                return (
                    <CustomizationColumnChart
                        propagateUpdates={this.props.propagateUpdates}
                        createChartVisualization={this.props.createChartVisualization}
                        restoreCustomizationState={keepCustomizationWidgetWhenChanged}
                    />
                );
            }
            case 'BarChart': {
                return (
                    <CustomizationBarChart
                        propagateUpdates={this.props.propagateUpdates}
                        createChartVisualization={this.props.createChartVisualization}
                        restoreCustomizationState={keepCustomizationWidgetWhenChanged}
                    />
                );
            }
            case 'ScatterChart': {
                return (
                    <CustomizationScatterChart
                        propagateUpdates={this.props.propagateUpdates}
                        createChartVisualization={this.props.createChartVisualization}
                        restoreCustomizationState={keepCustomizationWidgetWhenChanged}
                    />
                );
            }
            case 'LineChart': {
                return (
                    <CustomizationLineChart
                        propagateUpdates={this.props.propagateUpdates}
                        createChartVisualization={this.props.createChartVisualization}
                        restoreCustomizationState={keepCustomizationWidgetWhenChanged}
                    />
                );
            }
            case 'PieChart': {
                return (
                    <CustomizationPieChart
                        propagateUpdates={this.props.propagateUpdates}
                        createChartVisualization={this.props.createChartVisualization}
                        restoreCustomizationState={keepCustomizationWidgetWhenChanged}
                    />
                );
            }
            default: {
                return <div>ERROR</div>;
            }
        }
    };

    applySelectorMethod = () => {
        this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
    };

    /** component rendering entrance point * */
    render() {
        return <div>{this.createCustomizationWidget()}</div>;
    }
}

AbstractCustomizationWidget.propTypes = {
    propagateUpdates: PropTypes.func.isRequired,
    createChartVisualization: PropTypes.func.isRequired,
};
