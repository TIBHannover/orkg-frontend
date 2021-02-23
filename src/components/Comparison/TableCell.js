import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import ValuePlugins from '../ValuePlugins/ValuePlugins';
import Tippy from '@tippyjs/react';

const Item = styled.div`
    padding-right: 10px;
    padding: 0 10px !important;
    margin: 0;
    height: 100%;
`;

const ItemInner = styled.div`
    padding: ${props => props.cellPadding}px 5px;
    border-left: 2px solid #d5dae4;
    border-right: 2px solid #d5dae4;
    border-bottom: 2px solid #e7eaf1;
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
        let cellPadding = 10;
        if (this.props.viewDensity === 'normal') {
            cellPadding = 5;
        } else if (this.props.viewDensity === 'compact') {
            cellPadding = 1;
        }
        return (
            <>
                <Item>
                    <ItemInner cellPadding={cellPadding}>
                        {this.props.data &&
                            this.props.data.length > 0 &&
                            this.props.data.map((date, index) =>
                                Object.keys(date).length > 0 ? (
                                    date.type === 'resource' ? (
                                        <span key={`value-${date.resourceId}`}>
                                            {index > 0 && <ItemInnerSeparator />}
                                            <Tippy content={`Path of this value : ${date.pathLabels.slice(1).join(' / ')}`} arrow={true}>
                                                <div
                                                    className="btn-link"
                                                    onClick={() => this.openStatementBrowser(date.resourceId, date.label)}
                                                    style={{ cursor: 'pointer' }}
                                                    onKeyDown={e =>
                                                        e.keyCode === 13 ? this.openStatementBrowser(date.resourceId, date.label) : undefined
                                                    }
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <ValuePlugins type="resource">{date.label}</ValuePlugins>
                                                </div>
                                            </Tippy>
                                        </span>
                                    ) : (
                                        <span key={`value-${date.label}`}>
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
                        id={this.state.dialogResourceId}
                        label={this.state.dialogResourceLabel}
                    />
                )}
            </>
        );
    }
}

TableCell.propTypes = {
    data: PropTypes.array.isRequired,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact'])
};

export default TableCell;
