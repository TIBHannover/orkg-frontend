import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import ValuePlugins from '../ValuePlugins/ValuePlugins';
import Tippy from '@tippy.js/react';

const Item = styled.div`
    padding-right: 10px;
    padding: 0 10px !important;
    margin: 0;
    width: 250px;
    display: inline-block;
    height: 100%;
`;

const ItemInner = styled.div`
    padding: 10px 5px;
    border-left: 2px solid #cfcbcb;
    border-right: 2px solid #cfcbcb;
    border-bottom: 2px solid #edebeb;
    text-align: center;
    height: 100%;
    word-wrap: break-word;
`;

const ItemInnerSeparator = styled.hr`
    margin: 5px auto;
    width: 50%;
`;

class TableCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null
        };
    }

    openStatementBrowser = (id, label) => {
        this.setState({
            modal: true,
            dialogResourceId: id,
            dialogResourceLabel: label
        });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    render() {
        return (
            <>
                <Item>
                    <ItemInner>
                        {this.props.data.map((date, index) =>
                            Object.keys(date).length > 0 ? (
                                date.type === 'resource' ? (
                                    <span key={`value-${index}`}>
                                        {index > 0 && <ItemInnerSeparator />}
                                        <Tippy content={`Path of this value : ${date.pathLabels.slice(1).join(' / ')}`} arrow={true}>
                                            <span
                                                className="btn-link"
                                                onClick={() => this.openStatementBrowser(date.resourceId, date.label)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <ValuePlugins type="resource">{date.label}</ValuePlugins>
                                            </span>
                                        </Tippy>
                                    </span>
                                ) : (
                                    <span key={`value-${index}`}>
                                        {index > 0 && <ItemInnerSeparator />}
                                        <Tippy content={`Path of this value : ${date.pathLabels.slice(1).join(' / ')}`} arrow={true}>
                                            <span>
                                                <ValuePlugins type="literal" options={{ inModal: true }}>
                                                    {date.label}
                                                </ValuePlugins>
                                            </span>
                                        </Tippy>
                                    </span>
                                )
                            ) : (
                                <span className="font-italic" key={`value-${index}`}>
                                    Empty
                                </span>
                            )
                        )}
                    </ItemInner>
                </Item>

                {this.state.modal && (
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={() => this.toggle('modal')}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    />
                )}
            </>
        );
    }
}

TableCell.propTypes = {
    data: PropTypes.array.isRequired
};

export default TableCell;
