import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';

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
            const dataRow = {};

            if (cells.length > 0) {
                for (const [index, cell] of cells.entries()) {
                    dataRow[columns[index].dataField] = cell;
                }
            }
            data.push(dataRow);
        }

        if (columns.length === 0) {
            return;
        }

        return (
            <BootstrapTable
                keyField={'id'}
                data={data}
                columns={columns}
                cellEdit={cellEditFactory({ mode: 'dbclick' })}
                striped
                condensed
                bootstrap4
            />
        );

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
