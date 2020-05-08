import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable, { TableHeaderColumn } from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Table, Input } from 'reactstrap';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';

class TableEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extractedTable: null,
            loading: false
        };

        this.data = [['', 'Ford', 'Volvo', 'Toyota', 'Honda'], ['2016', 10, 11, 12, 13], ['2017', 20, 11, 14, 13], ['2018', 30, 15, 12, 13]];
    }

    render() {
        const columns = this.props.data[0].split(','); //.map(field => field);
        console.log(columns);
        const data = [];

        for (const [index, row] of this.props.data.entries()) {
            if (index === 0) {
                continue;
            }

            const cells = row.split(',');
            const dataRow = [];

            if (cells.length > 0) {
                for (const [index, cell] of cells.entries()) {
                    dataRow.push(cell);
                }
            }
            data.push(dataRow);
        }

        if (columns.length === 0) {
            return;
        }

        const fullData = [columns, ...data];

        return (
            <HotTable
                data={fullData}
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
            />
        );

        /*return (
            <BootstrapTable
                keyField={'id'}
                data={data}
                columns={columns}
                cellEdit={cellEditFactory({ mode: 'dbclick' })}
                striped
                condensed
                bootstrap4
                selectRow={selectRowProp}
            >
                {columns.map(column => (
                    <TableHeaderColumn dataField={column.dataField} headerAlign="right">
                        {column.text}
                    </TableHeaderColumn>
                ))}
            </BootstrapTable>
        );*/

        //return <CsvToHtmlTable tableClassName="table table-bordered table-sm" data={this.props.data} csvDelimiter="," />;
    }
}

TableEditor.propTypes = {
    data: PropTypes.array
};

TableEditor.defaultProps = {
    data: []
};

const mapStateToProps = state => ({
    pdf: state.pdfAnnotation.pdf
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TableEditor);
