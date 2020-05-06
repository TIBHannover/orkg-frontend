import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable, { TableHeaderColumn } from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Table, Input } from 'reactstrap';

class TableEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extractedTable: null,
            loading: false
        };
    }

    render() {
        const columns = this.props.data[0].split(',').map(field => ({
            dataField: field,
            text: field
        }));

        const data = [];

        for (const [index, row] of this.props.data.entries()) {
            if (index === 0) {
                continue;
            }

            const cells = row.split(',');
            const dataRow = [];

            if (cells.length > 0) {
                for (const [index, cell] of cells.entries()) {
                    dataRow.push({
                        value: cell,
                        column: columns[index].dataField
                    });
                }
            }
            data.push(dataRow);
        }

        if (columns.length === 0) {
            return;
        }

        return (
            <Table size="sm" striped>
                <thead>
                    <tr>
                        <th />
                        {columns.map(column => (
                            <th>{column.text}</th>
                        ))}
                    </tr>
                    <tr>
                        <td />
                        {columns.map(column => (
                            <th>
                                <Input type="select" bsSize="sm" name="select" id="exampleSelect">
                                    <option>Resource</option>
                                    <option>Literal</option>
                                </Input>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody contentEditable="plaintext-only" style={{ outline: 0 }}>
                    {data.map(row => (
                        <tr>
                            <td>
                                <input type="checkbox" />
                            </td>
                            {row.map(cell => (
                                <td>{cell.value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
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
