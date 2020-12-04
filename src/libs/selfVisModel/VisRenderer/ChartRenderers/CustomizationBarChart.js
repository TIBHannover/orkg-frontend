import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import SelfVisDataMode from '../../SelfVisDataModel';
import { createValueSelectors, createLabelSelectors, isMounted, getSelectorsState } from './HelperFunctions';
class CustomizationBarChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'BAR_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE'
        };
        this.errorCodeMessages = {
            BAR_CHART_NO_STRING_TYPES_FOR_LABEL: 'BarChart error: It appears there is no column mapped as string for labels',
            BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'BarChart error: It appears there is no column mapped as number for values'
        };
        this.yAxisSelectorMaxCount = -1;

        this.cachedXAxisSelector = undefined;
        this.cachedYAxisSelector = undefined;
    }

    state = {
        errorDataNotSupported: false,
        errorMessage: undefined,
        xAxisSelector: undefined,
        xAxisSelectorOpen: false,
        yAxisSelector: [],
        yAxisInterValSelectors: {},
        yAxisSelectorOpen: [],
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
        return <div> ERROR: {msg}</div>;
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
                        <div className="d-flex">Y-Axis:{this.createLabelSelectors()}</div>
                        <div className="d-flex">
                            X-Axis:<div>{this.createValueSelectors()}</div>
                        </div>
                    </>
                )}
                {this.yAxisSelectorMaxCount !== -1 && this.state.yAxisSelectorCount < this.yAxisSelectorMaxCount && (
                    <Button
                        onClick={() => {
                            this.setState({ yAxisSelectorCount: this.state.yAxisSelectorCount + 1 });
                        }}
                    >
                        Add X-Axis Value
                    </Button>
                )}
                {this.state.errorDataNotSupported && this.renderErrorMessages()}
            </div>
        );
    }
}
CustomizationBarChart.propTypes = {
    propagateUpdates: PropTypes.func,
    restoreCustomizationState: PropTypes.bool
};
export default CustomizationBarChart;
