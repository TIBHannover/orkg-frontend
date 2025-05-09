import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Alert, Button } from 'reactstrap';

import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import {
    addYAxisSelector,
    createLabelEditor,
    createLabelSelectors,
    createValueEditor,
    createValueSelectors,
    initializeFromCustomizer,
} from '@/libs/selfVisModel/VisRenderer/ChartRenderers/HelperFunctions';

class CustomizationLineChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'LINE_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE',
        };
        this.errorCodeMessages = {
            LINE_CHART_NO_STRING_TYPES_FOR_LABEL: 'LineChart error: It appears there is no column mapped as string for labels',
            LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'LineChart error: It appears there is no column mapped as number for values',
        };
        this.yAxisSelectorMaxCount = -1;
    }

    state = {
        errorDataNotSupported: false,
        errorMessage: undefined,
        errorValue: -1,
        xAxisSelector: undefined,
        yAxisSelector: [],
        xAxisSelectorOpen: false,
        yAxisSelectorOpen: [],
        yAxisInterValSelectors: {},
        yAxisSelectorCount: 1,
    };

    componentDidMount() {
        initializeFromCustomizer(this);
    }

    componentDidUpdate() {
        if (this.state.isInitialized) {
            this.props.createChartVisualization();
        }
    }

    createValueSelectors = () => createValueSelectors(this);

    createLabelSelectors = () => createLabelSelectors(this);

    createLabelEditor = () => createLabelEditor(this);

    createValueEditor = () => createValueEditor(this);

    renderErrorMessages = () => {
        const msg = this.errorCodeMessages[this.errorCodeItem[this.state.errorValue]];
        return <Alert color="danger">{msg}</Alert>;
    };

    setErrorCode = (val) => {
        this.setState({ errorDataNotSupported: true, errorValue: val });
    };

    addYAxisSelector = () => {
        addYAxisSelector(this);
    };

    render() {
        // mappings;
        return (
            <div>
                {!this.state.errorDataNotSupported && (
                    <>
                        X-axis{this.createLabelSelectors()}
                        Label{this.createLabelEditor()}
                        <hr />
                        Y-axis Label{this.createValueEditor()}
                        <hr />
                        {this.createValueSelectors()}
                    </>
                )}
                {this.yAxisSelectorMaxCount !== -1 && this.state.yAxisSelectorCount < this.yAxisSelectorMaxCount && (
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => {
                            this.addYAxisSelector();
                        }}
                    >
                        Add Y-axis value
                    </Button>
                )}
                {this.state.errorDataNotSupported && this.renderErrorMessages()}
            </div>
        );
    }
}
CustomizationLineChart.propTypes = {
    propagateUpdates: PropTypes.func,
    createChartVisualization: PropTypes.func,
    restoreCustomizationState: PropTypes.bool,
};
export default CustomizationLineChart;
