import React, { Component } from 'react';
import { Alert, Button } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { createValueSelectors, createLabelSelectors, isMounted, getSelectorsState } from './HelperFunctions';
import PropTypes from 'prop-types';

class CustomizationLineChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'LINE_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE'
        };
        this.errorCodeMessages = {
            LINE_CHART_NO_STRING_TYPES_FOR_LABEL: 'LineChart error: It appears there is no column mapped as string for labels',
            LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'LineChart error: It appears there is no column mapped as number for values'
        };
        this.yAxisSelectorMaxCount = -1;
        this.cachedXAxisSelector = undefined;
        this.cachedYAxisSelector = undefined;
    }

    state = {
        errorDataNotSupported: false,
        errorMessage: undefined,
        xAxisSelector: undefined,
        yAxisSelector: [],
        xAxisSelectorOpen: false,
        yAxisSelectorOpen: [],
        yAxisInterValSelectors: {},
        yAxisSelectorCount: 1
    };

    componentDidMount() {
        isMounted(this);
    }

    componentDidUpdate = () => {
        if (this.props.propagateUpdates) {
            this.props.propagateUpdates(getSelectorsState(this));
            this.selfVisModel.saveCustomizationState({ ...this.state, errorDataNotSupported: false, errorMessage: undefined, errorValue: -1 });
        }
    };

    createValueSelectors = () => {
        return createValueSelectors(this);
    };

    createLabelSelectors = () => {
        return createLabelSelectors(this);
    };

    renderErrorMessages = () => {
        const msg = this.errorCodeMessages[this.errorCodeItem[this.state.errorValue]];
        return <Alert color="danger">{msg}</Alert>;
    };

    setErrorCode = val => {
        this.setState({ errorDataNotSupported: true, errorValue: val });
    };

    render() {
        // mappings;
        return (
            <div>
                {!this.state.errorDataNotSupported && (
                    <>
                        X-axis{this.createLabelSelectors()}
                        <hr />
                        Y-axis{this.createValueSelectors()}
                    </>
                )}
                {this.yAxisSelectorMaxCount !== -1 && this.state.yAxisSelectorCount < this.yAxisSelectorMaxCount && (
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => {
                            this.setState({ yAxisSelectorCount: this.state.yAxisSelectorCount + 1 });
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
    restoreCustomizationState: PropTypes.bool
};
export default CustomizationLineChart;
