import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import SelfVisDataMode from '../../SelfVisDataModel';
import { createValueSelectors, createLabelSelectors, isMounted, getSelectorsState } from './HelperFunctions';
class CustomizationColumnChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'COL_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'COL_CHART_NO_NUMBER_TYPES_FOR_VALUE'
        };
        this.errorCodeMessages = {
            COL_CHART_NO_STRING_TYPES_FOR_LABEL: 'ColumnChart error: It appears there is no column mapped as string for labels',
            COL_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'ColumnChart error: It appears there is no column mapped as number for values'
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
        isMounted(this);
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.propagateUpdates) {
            this.props.propagateUpdates(getSelectorsState(this));
            this.selfVisModel.saveCustomizationState({ ...this.state });
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
                        <div className="d-flex">X-Axis:{this.createLabelSelectors()}</div>
                        <div className="d-flex">
                            Y-Axis:<div>{this.createValueSelectors()}</div>
                        </div>
                    </>
                )}
                {this.yAxisSelectorMaxCount !== -1 && this.state.yAxisSelectorCount < this.yAxisSelectorMaxCount && (
                    <Button
                        onClick={() => {
                            this.setState({ yAxisSelectorCount: this.state.yAxisSelectorCount + 1 });
                        }}
                    >
                        Add Y-Axis Value
                    </Button>
                )}
                {this.state.errorDataNotSupported && this.renderErrorMessages()}
            </div>
        );
    }
}
CustomizationColumnChart.propTypes = {
    propagateUpdates: PropTypes.func,
    restoreCustomizationState: PropTypes.bool
};
export default CustomizationColumnChart;
