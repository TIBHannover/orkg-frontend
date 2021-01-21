import React, { Component } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';

export default class VisualizationSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visualizationMethod: 'Table',
            visSelectionOpen: false,
            xAxisSelectorOpen: false,
            yAxisSelectorOpen: false,
            update: false,
            xAxisSelector: undefined,
            yAxisSelector: undefined,
            errorMessage: '',
            errorCode: -1
        };
        this.supportedVisualizationMethods = ['Table', 'BarChart', 'ColumnChart', 'ScatterChart', 'LineChart'];
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.selfVisModel.setRenderingEngine('Google-Charts'); // we only have GC at the moment;
    }

    componentDidMount = () => {
        this.setState({ visualizationMethod: this.selfVisModel.getRenderingMethod() ? this.selfVisModel.getRenderingMethod() : 'Table' });
    };

    componentDidUpdate = prevProps => {
        this.selfVisModel.setRenderingMethod(this.state.visualizationMethod);
        if (this.props.propagationFunction) {
            this.props.propagationFunction();
        }
    };

    createVisualizationSelector = () => {
        const items = this.supportedVisualizationMethods.map((item, id) => {
            return (
                <div key={'visSelectionDropdownDivItemIndexKey_' + id}>
                    <DropdownItem
                        key={'visSelectionDropdownItemIndexKey_' + id}
                        onClick={() => {
                            this.selfVisModel.setRenderingMethod(item);
                            this.setState({ visualizationMethod: item });
                        }}
                    >
                        <span>{item}</span>
                    </DropdownItem>
                </div>
            );
        });

        return (
            <Dropdown
                color="darkblue"
                size="sm"
                isOpen={this.state.visSelectionOpen}
                className="mt-1"
                toggle={() => {
                    this.setState({
                        visSelectionOpen: !this.state.visSelectionOpen
                    });
                }}
            >
                <DropdownToggle caret color="darkblue">
                    {this.state.visualizationMethod}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div className="px-3">
                <hr />
                Visualization method{this.createVisualizationSelector()}
                <hr />
            </div>
        );
    }
}

VisualizationSelector.propTypes = {
    propagationFunction: PropTypes.func
};
