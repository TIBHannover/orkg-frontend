import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import Tippy from '@tippy.js/react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
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
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.selfVisModel.setRenderingEngine('Google-Charts'); // we only have GC at the moment;
    }

    componentDidMount = () => {};

    componentDidUpdate = prevProps => {
        this.selfVisModel.setRenderingMethod(this.state.visualizationMethod);
        if (this.props.propagationFunction) {
            this.props.propagationFunction();
        }
    };

    createVisualizationSelector = () => {
        const items = this.supportedVisualizationMethods.map((item, id) => {
            return (
                <Tippy content="HELLO " placement="right" key={'visSelectionDropdownItemTippyKey_' + id}>
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
                </Tippy>
            );
        });

        return (
            <Dropdown
                color="darkblue"
                size="sm"
                //    className='mb-4 mt-4'
                style={{
                    marginLeft: '10px',
                    flexGrow: '1',
                    display: 'flex',
                    height: 'min-content',
                    paddingTop: '-5px'
                }}
                isOpen={this.state.visSelectionOpen}
                toggle={() => {
                    this.setState({
                        visSelectionOpen: !this.state.visSelectionOpen
                    });
                }}
            >
                <DropdownToggle
                    caret
                    color="darkblue"
                    style={{
                        padding: '0px',
                        paddingLeft: '3px',
                        border: 'solid 1px black'
                    }}
                >
                    {this.state.visualizationMethod}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex' }}>Visualization Method:{this.createVisualizationSelector()}</div>
            </div>
        );
    }
}

VisualizationSelector.propTypes = {
    propagationFunction: PropTypes.func
};
