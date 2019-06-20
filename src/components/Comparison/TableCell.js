import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import ValuePlugins from '../ValuePlugins/ValuePlugins';

const Item = styled.td`
    padding-right:10px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
`;

const ItemInner = styled.div`
    padding:10px 5px;
    border-left:2px solid #CFCBCB;
    border-right:2px solid #CFCBCB;
    border-bottom:2px solid #EDEBEB;
    text-align:center;
    height:100%;
`;


const ItemInnerSeparator = styled.hr`
    margin:5px auto;
    width:50%;
`;

class TableCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
        }
    }

    openStatementBrowser = (id, label) => {
        this.setState({
            modal: true,
            dialogResourceId: id,
            dialogResourceLabel: label,
        });
    }

    toggle = (type) => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }));
    }

    render() {
        return (
            <>
                <Item>
                    <ItemInner>
                        {this.props.data.map((date, index) => (
                            Object.keys(date).length > 0 ?
                                date.type === 'resource' ? (
                                    <span key={`value-${index}`}>
                                        {index > 0 && <ItemInnerSeparator />}
                                        <span
                                            className="btn-link"
                                            onClick={() => this.openStatementBrowser(date.resourceId, date.label)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <ValuePlugins>{date.label}</ValuePlugins>
                                        </span>
                                    </span>
                                ) : <>{index > 0 && <ItemInnerSeparator />}<ValuePlugins>{date.label}</ValuePlugins></>
                                : <span className="font-italic" key={`value-${index}`}>Empty</span>
                        ))}
                    </ItemInner>
                </Item>

                {this.state.modal &&
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={() => this.toggle('modal')}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    />
                }
            </>);
    }
}

TableCell.propTypes = {
    data: PropTypes.array.isRequired,
}

export default TableCell;