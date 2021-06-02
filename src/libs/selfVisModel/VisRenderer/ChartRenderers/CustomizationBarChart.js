import React, { Component } from 'react';
import { Alert, Button } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import {
    createValueSelectors,
    createLabelSelectors,
    createLabelEditor,
    addYAxisSelector,
    createValueEditor,
    initializeFromCustomizer
} from './HelperFunctionsRefactored';
import PropTypes from 'prop-types';

class CustomizationBarChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'BAR_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE'
        };
        this.errorCodeMessages = {
            BAR_CHART_NO_STRING_TYPES_FOR_LABEL: 'BarChart error: It appears there is no column mapped as string for labels',
            BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'BarChart error: It appears there is no column mapped as number for values'
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
        yAxisSelectorCount: 1
    };

    componentDidMount() {
        initializeFromCustomizer(this);
    }

    componentDidUpdate = () => {
        if (this.state.isInitialized) {
            this.props.createChartVisualization();
        }
    };

    createValueSelectors = () => {
        return createValueSelectors(this);
    };

    createLabelSelectors = () => {
        return createLabelSelectors(this);
    };

    createLabelEditor = () => {
        return createLabelEditor(this);
    };
    createValueEditor = () => {
        return createValueEditor(this);
    };

    renderErrorMessages = () => {
        const msg = this.errorCodeMessages[this.errorCodeItem[this.state.errorValue]];
        return <Alert color="danger">{msg}</Alert>;
    };

    setErrorCode = val => {
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
                        Y-axis{this.createLabelSelectors()}
                        <div className="mt-2">Label{this.createLabelEditor()}</div>
                        <hr />
                        X-axis Label<div className="mt-2">{this.createValueEditor()}</div>
                        {this.createValueSelectors()}
                    </>
                )}
                {this.yAxisSelectorMaxCount !== -1 && this.state.yAxisSelectorCount < this.yAxisSelectorMaxCount && (
                    <Button
                        color="primary"
                        size="sm"
                        className="mt-1"
                        onClick={() => {
                            this.addYAxisSelector();
                        }}
                    >
                        Add X-axis value
                    </Button>
                )}
                {this.state.errorDataNotSupported && this.renderErrorMessages()}
            </div>
        );
    }
}
CustomizationBarChart.propTypes = {
    propagateUpdates: PropTypes.func,
    createChartVisualization: PropTypes.func,
    restoreCustomizationState: PropTypes.bool
};
export default CustomizationBarChart;
