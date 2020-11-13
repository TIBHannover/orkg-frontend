import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import RenderingTable from '../VisualizationService/Models/RenderingTable';
import DebugRenderer from '../VisualizationService/Renderers/DebugRenderer';
import DataForChart from '../VisualizationService/googleDataWrapper';
import BarChart from '../VisualizationService/Renderers/ChartRenderers/BarChart';
import ColumnChart from '../VisualizationService/Renderers/ChartRenderers/ColumnChart';

import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Chart } from 'react-google-charts';

class ChartViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMappedData: false,
            visualizationMethod: 'Table',
            visSelectionOpen: false,
            xAxisSelectorOpen: false,
            yAxisSelectorOpen: false,
            useMappedVersion: false,
            update: false,
            xAxisSelector: undefined,
            yAxisSelector: undefined,
            errorMessage: '',
            errorCode: -1
        };

        this.supportedVisualizationMethods = ['Table', 'BarChart', 'ColumnChart'];
    }

    componentDidMount = () => {
        console.log('Chart Vis mounts');
        const renderingInfo = this.props.getTableModel();

        const renderingTable = new RenderingTable(renderingInfo);
        const gcw = new DataForChart(renderingTable);
        this.setState({ hasMappedData: true, tableData: renderingTable, dataForChartVis: gcw });
    };

    componentDidUpdate = (prevProps, prevState) => {};

    createVisualizationSelector = () => {
        const items = this.supportedVisualizationMethods.map((item, id) => {
            return (
                <DropdownItem
                    key={'visSelectiondropdownItemIndexKey' + '_' + id}
                    onClick={() => {
                        this.setState({ visualizationMethod: item });
                    }}
                >
                    {item}
                </DropdownItem>
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

    render() {
        if (this.state.hasMappedData) {
            // create google-chart Wrapper;
            console.log('Should Update? ', this.state.update);

            return (
                <div style={{ padding: '10px' }}>
                    <div style={{ display: 'flex' }}>Select Visualization Method{this.createVisualizationSelector()}</div>
                    {this.state.visualizationMethod === this.supportedVisualizationMethods[0] && (
                        <Chart
                            chartType={this.state.visualizationMethod}
                            data={this.state.dataForChartVis.getChartData()}
                            width="100%"
                            height="500px"
                            options={{ showRowNumber: true }}
                        />
                    )}
                    {this.state.visualizationMethod === this.supportedVisualizationMethods[1] && <BarChart tableData={this.state.dataForChartVis} />}
                    {this.state.visualizationMethod === this.supportedVisualizationMethods[2] && (
                        <ColumnChart tableData={this.state.dataForChartVis} />
                    )}
                </div>
            );
        } else {
            return <div>Select Data, Select Mappers, then Visualize</div>;
        }
    }
}

ChartViewer.propTypes = {
    tableData: PropTypes.object,
    modalBodyHeight: PropTypes.any,
    getTableModel: PropTypes.func,
    isTransposed: PropTypes.bool
};
export default ChartViewer;

/** 
 * 
 * 
 * 
 *   createVisualizationSelector = () => {
        const items = this.supportedVisualizationMethods.map((item, id) => {
            return (
                <DropdownItem
                    key={'visSelectiondropdownItemIndexKey' + '_' + id}
                    onClick={() => {
                        this.setState({ visualizationMethod: item });
                    }}
                >
                    {item}
                </DropdownItem>
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
 
 renderColumnMappers = () => {
        if (
            this.state.visualizationMethod === this.supportedVisualizationMethods[1] ||
            this.state.visualizationMethod === this.supportedVisualizationMethods[0]
        ) {
            // create the mapper for x and y axis selection;
            return (
                <div>
                    <div style={{ display: 'flex' }}>Select column for label {this.createLabelSelectors()}</div>
                    <div style={{ display: 'flex' }}>Select column for value {this.createValueSelectors()}</div>
                </div>
            );
        }
    };
 * 
 * 
 * 
 * createXAxisSelector = defaultColId => {
 * 
 * 
 * 
 * 
        // we get the default selection from the model;

        const labelSelectors = [];
        this.state.dataForChartVis.header.forEach(item => {
            if (item.type === 'string') {
                labelSelectors.push(item.label);
            }
        });
        if (this.state.xAxisSelector === undefined) {
            this.setState({ xAxisSelector: labelSelectors[0] });
        }

        const items = labelSelectors.map((item, id) => {
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
                        padding: '0px',
                        paddingLeft: '3px',
                        border: 'solid 1px black'
                    }}
                >
                    {this.state.xAxisSelector ? this.state.xAxisSelector : this.state.dataForChartVis.header[defaultColId].label}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );

        // return <div> {this.state.dataForChartVis.header[defaultColId].label}</div>;
    };
 
 
 createLabelSelectors = () => {
        // we get the default selection from the model;

        const labelSelectors = [];
        this.state.dataForChartVis.header.forEach(item => {
            if (item.type === 'string') {
                labelSelectors.push(item.label);
            }
        });
        if (labelSelectors.length === 0) {
            if (this.state.visualizationMethod === this.supportedVisualizationMethods[1]) {
                this.setErrorCode(0);
            }
            if (this.state.visualizationMethod === this.supportedVisualizationMethods[2]) {
                this.setErrorCode(2);
            }
        }
        if (this.state.xAxisSelector === undefined) {
            // mapping errors on initialization;

            this.setState({ xAxisSelector: labelSelectors[0] });
        }

        console.log('WANT TO MAP LABEL SELECTORS', labelSelectors);

        const items = labelSelectors.map((item, id) => {
            return (
                <DropdownItem
                    key={'XSelectionDropdownItemIndexKey_' + id}
                    onClick={() => {
                        this.setState({ xAxisSelector: item });
                    }}
                >
                    {item}
                </DropdownItem>
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
                        padding: '0px',
                        paddingLeft: '3px',
                        border: 'solid 1px black'
                    }}
                >
                    {this.state.xAxisSelector ? this.state.xAxisSelector : labelSelectors[0]}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );

        // return <div> {this.state.dataForChartVis.header[defaultColId].label}</div>;
    };
 
 createValueSelectors = () => {
        // only numbers are valid selectors;
        const valueSelectors = [];
        this.state.dataForChartVis.header.forEach(item => {
            if (item.type === 'number') {
                valueSelectors.push(item.label);
            }
        });
        if (valueSelectors.length === 0) {
            console.log('THIS SHALL THROW AN ERROR');
            console.log(this.state.visualizationMethod);
            console.log(this.supportedVisualizationMethods);
            if (this.state.visualizationMethod === this.supportedVisualizationMethods[1]) {
                console.log('ERROR CODE 1');
                this.setErrorCode(1);
            }
            if (this.state.visualizationMethod === this.supportedVisualizationMethods[2]) {
                console.log('ERROR CODE 3');
                this.setErrorCode(3);
            }
        }
        if (this.state.yAxisSelector === undefined && valueSelectors[0]) {
            this.setState({ yAxisSelector: valueSelectors[0] });
        }
        console.log('WANT TO MAP VALUE SELECTORS', valueSelectors);

        const items = valueSelectors.map((item, id) => {
            return (
                <DropdownItem
                    key={'YSelectionDropdownItemIndexKey_' + id}
                    onClick={() => {
                        this.setState({ yAxisSelector: item });
                    }}
                >
                    {item}
                </DropdownItem>
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
                isOpen={this.state.yAxisSelectorOpen}
                toggle={() => {
                    this.setState({
                        yAxisSelectorOpen: !this.state.yAxisSelectorOpen
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
                    {this.state.yAxisSelector ? this.state.yAxisSelector : valueSelectors[0]}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    };
 createYAxisSelector = defaultColId => {
        if (this.state.yAxisSelector === undefined) {
            this.setState({ yAxisSelector: this.state.dataForChartVis.header[defaultColId].label });
        }

        const items = this.state.dataForChartVis.header.map((item, id) => {
            return (
                <DropdownItem
                    key={'YSelectionDropdownItemIndexKey_' + id}
                    onClick={() => {
                        this.setState({ yAxisSelector: item.label });
                    }}
                >
                    {item.label}
                </DropdownItem>
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
                isOpen={this.state.yAxisSelectorOpen}
                toggle={() => {
                    this.setState({
                        yAxisSelectorOpen: !this.state.yAxisSelectorOpen
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
                    {this.state.yAxisSelector ? this.state.yAxisSelector : this.state.dataForChartVis.header[defaultColId].label}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    };
 
 this.errorCodeItem = {
            0: 'BAR_CHART_NO_STRING_TYPES_FOR_LABEL',
            1: 'BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE',
            2: 'COL_CHART_NO_STRING_TYPES_FOR_LABEL',
            3: 'COL_CHART_NO_STRING_TYPES_FOR_VALUE'
        };
 this.errorCodeMessages = {
            BAR_CHART_NO_STRING_TYPES_FOR_LABEL: 'BarChart error: It appears there is no column mapped as string for labels',
            BAR_CHART_NO_NUMBER_TYPES_FOR_VALUE: 'BarChart error: It appears there is no column mapped as number for values',
            COL_CHART_NO_STRING_TYPES_FOR_LABEL: 'ColumnChart error: It appears there is no column mapped as number for values',
            COL_CHART_NO_STRING_TYPES_FOR_VALUE: 'ColumnChart error: It appears there is no column mapped as number for values'
        };
 **/
