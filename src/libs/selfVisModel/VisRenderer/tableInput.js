import React, { Component } from 'react';

import SelfVisDataMode from '../SelfVisDataModel';
import { Chart } from 'react-google-charts';
import * as PropTypes from 'prop-types';
export default class TableInput extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.state = { isExpanded: true };
        this.tableData = this.createTableFromModel();
    }

    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
    };

    createTableFromModel = () => {
        // access the model and get the filtered stuff;
        return this.selfVisModel._googleChartsData.getChartData();

        // now create the table data
    };

    createTableFromInputData = () => {
        // create data for the tableChart

        return <Chart chartType="Table" data={this.tableData} width="100%" height={this.props.height - 5} options={{ showRowNumber: true }} />;
    };

    /** component rendering entrance point **/
    render() {
        return <div> {this.createTableFromInputData()}</div>;
    }
}

TableInput.propTypes = {
    height: PropTypes.number
};
