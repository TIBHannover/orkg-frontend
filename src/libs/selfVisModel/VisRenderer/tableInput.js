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

    createTableFromModel = () => {
        // access the model and get the data for google charts ;
        return this.selfVisModel._googleChartsData.getChartData();
    };

    createTableFromInputData = () => {
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
