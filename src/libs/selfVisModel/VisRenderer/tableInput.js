import React, { Component } from 'react';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { Chart } from 'react-google-charts';
import PropTypes from 'prop-types';

export default class TableInput extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.state = { isExpanded: true };
        this.tableData = this.createTableFromModel();
    }

    createTableFromModel = () =>
        // access the model and get the data for google charts ;
        this.selfVisModel._googleChartsData.getChartData();

    createTableFromInputData = () => (
        <Chart chartType="Table" data={this.tableData} width="100%" height={this.props.height - 5} options={{ showRowNumber: true }} />
    );

    /** component rendering entrance point * */
    render() {
        return <div> {this.createTableFromInputData()}</div>;
    }
}

TableInput.propTypes = {
    height: PropTypes.number,
};
