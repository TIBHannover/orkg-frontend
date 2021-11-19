import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import ValuePlugins from '../ValuePlugins/ValuePlugins';
import { PREDICATE_TYPE_ID, RESOURCE_TYPE_ID } from 'constants/misc';
import Tippy from '@tippyjs/react';

export const Item = styled.div`
    padding-right: 10px;
    padding: 0 10px !important;
    margin: 0;
    height: 100%;
    background: #fff;
`;

export const ItemInner = styled.div`
    padding: ${props => props.cellPadding}px 5px;
    border-left: 2px solid #d5dae4;
    border-right: 2px solid #d5dae4;
    border-bottom: 2px solid #e7eaf1;
    text-align: center;
    height: 100%;
    word-wrap: break-word;

    &:hover .create-button {
        display: block;
    }
`;

export const ItemInnerSeparator = styled.hr`
    margin: 5px auto;
    width: 50%;
`;

class TableCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            dialogResourceType: RESOURCE_TYPE_ID
        };
    }

    openStatementBrowser = (id, label, type = null) => {
        this.setState(
            {
                dialogResourceId: id,
                dialogResourceLabel: label,
                dialogResourceType: type ? type : RESOURCE_TYPE_ID
            },
            () => {
                this.setState({ modal: true });
            }
        );
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    PathTooltipContent = data => {
        return (
            <div className="fullPath">
                Path of this value :{' '}
                {data.pathLabels?.map((path, index) => {
                    const resourceType = index % 2 === 0 ? RESOURCE_TYPE_ID : PREDICATE_TYPE_ID;
                    return (
                        <span key={index}>
                            <span
                                className="btn-link"
                                onClick={() => this.openStatementBrowser(data.path[index], path, resourceType)}
                                style={{ cursor: 'pointer' }}
                                onKeyDown={e => (e.keyCode === 13 ? this.openStatementBrowser(data.path[index], path, resourceType) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                {path}
                            </span>
                            {index !== data.pathLabels?.length - 1 && ' / '}
                        </span>
                    );
                })}
            </div>
        );
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
                    <ItemInner cellPadding={cellPadding} className={this.props.data === undefined ? 'itemGroup' : ''}>
                        {this.props.data &&
                            this.props.data.length > 0 &&
                            this.props.data.map((date, index) => {
                                return (
                                    Object.keys(date).length > 0 &&
                                    (date.type === 'resource' ? (
                                        <span key={`value-${date.resourceId}`}>
                                            {index > 0 && <ItemInnerSeparator />}
                                            <Tippy
                                                content={this.PathTooltipContent(date)}
                                                arrow={true}
                                                disabled={date.pathLabels?.length <= 1}
                                                interactive={true}
                                            >
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
                                        <span key={`value-${date.label}-${index}`}>
                                            {index > 0 && <ItemInnerSeparator />}
                                            <Tippy
                                                content={this.PathTooltipContent(date)}
                                                arrow={true}
                                                disabled={date.pathLabels?.length <= 1}
                                                interactive={true}
                                            >
                                                <span>
                                                    <ValuePlugins type="literal" options={{ inModal: true }}>
                                                        {date.label}
                                                    </ValuePlugins>
                                                </span>
                                            </Tippy>
                                        </span>
                                    ))
                                );
                            })}
                    </ItemInner>
                </Item>

                {this.state.modal && (
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={() => this.toggle('modal')}
                        id={this.state.dialogResourceId}
                        label={this.state.dialogResourceLabel}
                        type={this.state.dialogResourceType}
                    />
                )}
            </>
        );
    }
}

TableCell.propTypes = {
    data: PropTypes.array,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact'])
};

export default TableCell;
