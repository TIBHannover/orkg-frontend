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
        const self = this;
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
                contextMenu={{
                    items: [
                        'row_above',
                        'row_below',
                        '---------',
                        'col_left',
                        'col_right',
                        '---------',
                        'remove_row',
                        'remove_col',
                        '---------',
                        'undo',
                        'redo',
                        {
                            name: function() {
                                return 'Merge cells';
                            },
                            callback: function(key, selection, clickEvent) {
                                if (selection.length > 0) {
                                    const firstSelection = selection[0];
                                    const selectionStart = firstSelection.start;
                                    const selectionEnd = firstSelection.end;

                                    // only support merging in the same column for now
                                    if (selectionStart.col === selectionEnd.col) {
                                        let tableUpdates = [];
                                        let newValue = self.props.tableData[selectionStart.row][selectionStart.col];
                                        const rowAmount = selectionEnd.row - selectionStart.row;

                                        for (let i = 1; i <= rowAmount; i++) {
                                            tableUpdates.push([selectionStart.row + i, selectionEnd.col, null, '']);
                                            newValue += ' ' + self.props.tableData[selectionStart.row + i][selectionStart.col];
                                        }

                                        tableUpdates.push([selectionStart.row, selectionStart.col, null, newValue]);
                                        self.props.updateTableData(tableUpdates);
                                    }
                                }
                            }
                        },
                        {
                            name: function() {
                                return 'Remove empty rows';
                            },
                            callback: function(key, selection, clickEvent) {
                                const rowAmount = this.countRows();

                                let toRemove = [];
                                for (let i = 0; i < rowAmount; i++) {
                                    if (this.isEmptyRow(i)) {
                                        toRemove.push([i, 1]);
                                    }
                                }
                                this.alter('remove_row', toRemove);
                            }
                        }
                    ]
                }}
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
