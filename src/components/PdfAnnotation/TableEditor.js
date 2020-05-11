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
                ref={this.props.setRef}
            />
        );
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
