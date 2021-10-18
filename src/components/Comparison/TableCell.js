import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import ValuePlugins from '../ValuePlugins/ValuePlugins';
import Tippy from '@tippyjs/react';
import { ENTITIES } from 'constants/graphSettings';

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
            // isEqualPaths is used as a workaround for this issue: https://gitlab.com/TIBHannover/orkg/orkg-similarity/-/issues/36
            isEqualPaths: this.props.data?.length > 0 ? this.props.data[0].pathLabels?.length === this.props.data[0].path?.length : true,
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            dialogResourceType: ENTITIES.RESOURCE,
            path: []
        };
    }

    openStatementBrowser = (id, label, type = null, path = []) => {
        this.setState(
            {
                dialogResourceId: id,
                dialogResourceLabel: label,
                dialogResourceType: type ? type : ENTITIES.RESOURCE,
                path: path
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

    PathTooltipContent = (data, cellDataValue) => {
        return (
            <div className="fullPath">
                Path of this value :{' '}
                {data.pathLabels?.map((path, index) => {
                    const resourceType = this.state.isEqualPaths
                        ? index % 2 === 0
                            ? ENTITIES.RESOURCE
                            : ENTITIES.PREDICATE
                        : index % 2 !== 0
                        ? ENTITIES.RESOURCE
                        : ENTITIES.PREDICATE;
                    return (
                        <span key={index}>
                            <span
                                className={resourceType !== ENTITIES.PREDICATE ? 'btn-link' : ''}
                                onClick={() =>
                                    resourceType !== ENTITIES.PREDICATE
                                        ? this.openStatementBrowser(
                                              data.path[this.state.isEqualPaths ? index : index + 1],
                                              path,
                                              resourceType,
                                              resourceType === ENTITIES.RESOURCE
                                                  ? data.pathLabels.slice(0, this.state.isEqualPaths ? index : index + 1).map((l, i) => ({
                                                        id: cellDataValue.path[i],
                                                        label: l,
                                                        _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE
                                                    }))
                                                  : []
                                          )
                                        : null
                                }
                                style={{ cursor: resourceType !== ENTITIES.PREDICATE ? 'pointer' : 'default' }}
                                onKeyDown={e =>
                                    e.keyCode === 13
                                        ? () =>
                                              resourceType !== ENTITIES.PREDICATE
                                                  ? this.openStatementBrowser(
                                                        data.path[this.state.isEqualPaths ? index : index + 1],
                                                        path,
                                                        resourceType,
                                                        resourceType === ENTITIES.RESOURCE
                                                            ? data.pathLabels.slice(0, this.state.isEqualPaths ? index : index + 1).map((l, i) => ({
                                                                  id: cellDataValue.path[i],
                                                                  label: l,
                                                                  _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE
                                                              }))
                                                            : []
                                                    )
                                                  : null
                                        : undefined
                                }
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

    onClickHandle = (date, index) => {
        this.openStatementBrowser(
            date.resourceId,
            date.label,
            null,
            date.pathLabels.map((l, i) => ({
                id: this.props.data[index].path[i],
                label: l,
                _class: this.state.isEqualPaths
                    ? i % 2 === 0
                        ? ENTITIES.RESOURCE
                        : ENTITIES.PREDICATE
                    : i % 2 !== 0
                    ? ENTITIES.RESOURCE
                    : ENTITIES.PREDICATE
            }))
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
                                    (date.type === ENTITIES.RESOURCE ? (
                                        <span key={`value-${date.resourceId}`}>
                                            {index > 0 && <ItemInnerSeparator />}
                                            <Tippy
                                                content={this.PathTooltipContent(date, this.props.data[index])}
                                                arrow={true}
                                                disabled={date.pathLabels?.length <= 1}
                                                interactive={true}
                                            >
                                                <div
                                                    className="btn-link"
                                                    onClick={() => this.onClickHandle(date, index)}
                                                    style={{ cursor: 'pointer' }}
                                                    onKeyDown={e => (e.keyCode === 13 ? this.onClickHandle(date, index) : undefined)}
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
                                            <Tippy
                                                content={this.PathTooltipContent(date, this.props.data[index])}
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
                        initialPath={this.state.path}
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
