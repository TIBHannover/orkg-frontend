import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable, { TableHeaderColumn } from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Table, Input } from 'reactstrap';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import { setTableData, updateTableData } from '../../actions/pdfAnnotation';

class TableEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extractedTable: null,
            loading: false
        };
    }

    /*componentDidUpdate(prevProps) {
        if (this.props.tableData !== prevProps.tableData) {
            console.log('this.props.tableData', this.props.tableData);
            //this.props.setRef.current.hotInstance.loadData(this.props.tableData);
        }
    }*/

    render() {
        console.log('this.props.tableData1', this.props.tableData);

        return (
            <HotTable
                data={this.props.tableData}
                //dropdownMenu={true}
                rowHeaders={true}
                width="100%"
                height="auto"
                /*colHeaders={col => {
                    return `<div contenteditable="true">${columns[col]}</div>`;
                }}*/
                licenseKey="non-commercial-and-evaluation"
                contextMenu={true}
                stretchH={'all'}
                ref={this.props.setRef}
                beforeChange={this.props.updateTableData}
            />
        );
    }
}

const mapStateToProps = state => ({
    pdf: state.pdfAnnotation.pdf,
    tableData: state.pdfAnnotation.tableData
});

const mapDispatchToProps = dispatch => ({
    setTableData: payload => dispatch(setTableData(payload)),
    updateTableData: payload => dispatch(updateTableData(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TableEditor);
