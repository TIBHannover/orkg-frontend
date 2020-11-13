import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import SelfVisDataMode from '../../SelfVisDataModel';
class CustomizationLineChart extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.errorCodeItem = {
            0: 'LINE_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE'
        };
        this.errorCodeMessages = {
            LINE_CHART_NO_STRING_TYPES_FOR_LABEL: 'ScatterChart error: It appears there is no column mapped as string for labels',
            LINE_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'ScatterChart error: It appears there is no column mapped as number for values'
        };
        this.yAxisSelectorMaxCount = -1;
    }

    state = {
        errorDataNotSupported: false,
        errorMessage: undefined,
        xAxisSelector: undefined,
        yAxisSelector: [],
        xAxisSelectorOpen: false,
        yAxisSelectorOpen: [],
        yAxisSelectorCount: 1
    };

    componentDidMount() {
        if (this.props.propagateUpdates) {
            this.props.propagateUpdates(this.getSelectorsState());
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.propagateUpdates) {
            this.props.propagateUpdates(this.getSelectorsState());
        }
    };

    getSelectorsState = () => {
        return {
            xAxis: this.state.xAxisSelector,
            yAxis: this.state.yAxisSelector
        };
    };

    createValueSelectors = () => {
        // we get the default selection from the model;
        // find properties that map to strings;
        const selectedPropertyAnchors = this.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);
        const possibleValueCandidates = selectedPropertyAnchors.filter(item => item.propertyMapperType === 'Number');
        if (possibleValueCandidates.length === 0) {
            this.setErrorCode(1);
        } else {
            if (this.yAxisSelectorMaxCount === -1) {
                this.yAxisSelectorMaxCount = possibleValueCandidates.length;
            }
            const itemsArray = [];
            for (let i = 0; i < this.state.yAxisSelectorCount; i++) {
                const items = possibleValueCandidates.map((item, id) => {
                    return (
                        <DropdownItem
                            key={'XSelectionDropdownItemIndexKey_' + id}
                            onClick={() => {
                                const yAxisSelector = this.state.yAxisSelector;
                                yAxisSelector[i] = item.label;
                                this.setState({ yAxisSelector: yAxisSelector });
                            }}
                        >
                            {item.label}
                        </DropdownItem>
                    );
                });
                itemsArray.push(items);
            }
            // initialize yAxisSelectors;
            if (this.state.yAxisSelector.length === 0) {
                const possibleSelectors = [];
                for (let i = 0; i < this.state.yAxisSelectorCount; i++) {
                    possibleSelectors.push(possibleValueCandidates[0].label);
                }
                this.setState({ yAxisSelector: possibleSelectors });
            }

            return itemsArray.map((selector, id) => {
                return (
                    <Dropdown
                        color="darkblue"
                        size="sm"
                        //    className='mb-4 mt-4'
                        style={{
                            marginLeft: '10px',
                            marginBottom: '5px',
                            flexGrow: '1',
                            display: 'flex',
                            height: 'min-content',
                            paddingTop: '-5px'
                        }}
                        isOpen={this.state.yAxisSelectorOpen[id]}
                        toggle={() => {
                            const yAxisSelectorOpen = this.state.yAxisSelectorOpen;
                            yAxisSelectorOpen[id] = !yAxisSelectorOpen[id];
                            this.setState({
                                yAxisSelectorOpen: yAxisSelectorOpen
                            });
                        }}
                    >
                        <DropdownToggle
                            caret
                            color="darkblue"
                            style={{
                                padding: '5px',
                                paddingLeft: '3px',
                                border: 'solid 1px black'
                            }}
                        >
                            {this.state.yAxisSelector[id] ? this.state.yAxisSelector[id] : possibleValueCandidates[0].label}
                        </DropdownToggle>
                        <DropdownMenu>{itemsArray[id]}</DropdownMenu>
                    </Dropdown>
                );
            });
        }
    };

    createLabelSelectors = () => {
        // we get the default selection from the model;
        // find properties that map to strings;
        const selectedPropertyAnchors = this.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);
        const possibleLabelCandidates = selectedPropertyAnchors.filter(
            item => item.propertyMapperType === 'String' || item.propertyMapperType === 'Date'
        );
        possibleLabelCandidates.unshift({ label: 'Contribution' });

        if (possibleLabelCandidates.length === 0) {
            this.setErrorCode(0);
        } else {
            const items = possibleLabelCandidates.map((item, id) => {
                return (
                    <DropdownItem
                        key={'XSelectionDropdownItemIndexKey_' + id}
                        onClick={() => {
                            this.setState({ xAxisSelector: item.label });
                        }}
                    >
                        {item.label}
                    </DropdownItem>
                );
            });

            if (!this.state.xAxisSelector) {
                this.setState({ xAxisSelector: possibleLabelCandidates[0].label });
            }
            return (
                <Dropdown
                    color="darkblue"
                    size="sm"
                    //    className='mb-4 mt-4'
                    style={{
                        marginLeft: '10px',
                        marginBottom: '5px',
                        flexGrow: '1',
                        display: 'flex',
                        height: 'min-content',
                        paddingTop: '-5px'
                    }}
                    isOpen={this.state.xAxisSelectorOpen}
                    toggle={() => {
                        this.setState({
                            xAxisSelectorOpen: !this.state.xAxisSelectorOpen
                        });
                    }}
                >
                    <DropdownToggle
                        caret
                        color="darkblue"
                        style={{
                            padding: '5px',
                            paddingLeft: '3px',
                            border: 'solid 1px black'
                        }}
                    >
                        {this.state.xAxisSelector ? this.state.xAxisSelector : possibleLabelCandidates[0].label}
                    </DropdownToggle>
                    <DropdownMenu>{items}</DropdownMenu>
                </Dropdown>
            );
        }
    };

    renderErrorMessages = () => {
        return <div> ERROR MESSAGES: {this.state.errorMessage}</div>;
    };

    // renderColumnMappers = () => {
    //     return (
    //         <div>
    //             <div style={{ display: 'flex' }}>Select column for label {this.createLabelSelectors()}</div>
    //             <div style={{ display: 'flex' }}>Select column for value {this.createValueSelectors()}</div>
    //         </div>
    //     );
    // };

    setErrorCode = val => {
        this.setState({ errorDataNotSupported: true, errorMessage: this.errorCodeMessages[this.errorCodeItem[val]] });
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
CustomizationLineChart.propTypes = {
    propagateUpdates: PropTypes.func
};
export default CustomizationLineChart;
