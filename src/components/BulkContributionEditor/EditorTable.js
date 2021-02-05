import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TableCell from 'components/BulkContributionEditor/TableCell';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { Contribution, Delete, ItemHeader, ItemHeaderInner, Properties, PropertiesInner, ReactTableWrapper } from 'components/Comparison/styled';
import ROUTES from 'constants/routes';
import { functions, isEqual, omit } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import ReactTable from 'react-table';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

const compareProps = (prevProps, nextProps) => {
    // remove functions from equality check (mainly targeting "removeContribution"), otherwise it is always false
    return isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps)));
};

const EditorTable = props => {
    const scrollContainerHead = useRef(null);
    const customProps = { id: 'comparisonTable' };
    console.log('data', props.data);
    /*const data = [
        {
            property: {
                label: 'test',
                id: 'R100'
            },
            values: [
                [
                    {
                        label: 'test',
                        resourceId: 'R3100',
                        type: 'resource',
                        pathLabels: ['test']
                    }
                ],
                [
                    {
                        label: 'test322323',
                        resourceId: 'R3100',
                        type: 'resource',
                        pathLabels: ['test']
                    }
                ]
            ]
        },
        {
            property: {
                label: 'test22',
                id: 'R1003'
            },
            values: [
                [
                    {
                        label: 'test5',
                        resourceId: 'R1020',
                        type: 'resource',
                        pathLabels: ['test']
                    }
                ],
                [
                    {
                        label: 'tes4',
                        resourceId: 'R1020',
                        type: 'resource',
                        pathLabels: ['test']
                    }
                ]
            ]
        }
    ];*/
    let data = [];
    let columns = [];
    if (props.data) {
        data = Object.keys(props.data.properties).map((propertyId, index) => {
            const property = props.data.properties[propertyId];
            const returnObj = {
                property: property,
                values: Object.keys(props.data.contributions).map((contributionId, index2) => {
                    const contribution = props.data.contributions[contributionId];
                    return contribution.contributionData[propertyId] || [{}];
                })
            };
            return returnObj;
        });
        console.log('data', data);

        columns = [
            {
                Header: (
                    <Properties>
                        <PropertiesInner transpose={false} className="first">
                            Properties
                        </PropertiesInner>
                    </Properties>
                ),
                accessor: 'property',
                fixed: 'left',
                Cell: cell => (
                    <Properties className="columnProperty">
                        <PropertiesInner cellPadding={10}>
                            {cell.value.label}
                            <TableCellButtons isHovering={true} onEdit={() => {}} onDelete={() => {}} backgroundColor="rgba(128, 134, 155, 0.8)" />
                        </PropertiesInner>
                    </Properties>
                ),
                width: 250
            },
            ...Object.keys(props.data.contributions).map((contributionId, i) => {
                const contribution = props.data.contributions[contributionId];
                return {
                    id: contribution.id,
                    Header: () => (
                        <ItemHeader key={contribution.id}>
                            <ItemHeaderInner>
                                <Link
                                    to={reverse(ROUTES.VIEW_PAPER, {
                                        resourceId: contribution.paperId, //contribution.paperId,
                                        contributionId: contribution.id //contribution.id
                                    })}
                                >
                                    {contribution.title ? contribution.title : <em>No title</em>}
                                </Link>
                                <br />
                                <Contribution>
                                    {contribution.year && `${contribution.year} - `}
                                    {contribution.contributionLabel}
                                </Contribution>
                            </ItemHeaderInner>

                            <Delete>
                                <Icon icon={faTimes} />
                            </Delete>
                        </ItemHeader>
                    ),
                    accessor: d => {
                        return d.values[i];
                    },
                    Cell: cell => {
                        const values = cell.value;

                        return <TableCell values={cell.value} />;
                        // return <TableCell data={cell.value} />;
                    },
                    width: 250
                };
            })
        ];
    }

    const handleScrollCallback = () => {};

    return (
        <ReactTableWrapper>
            <ScrollSync onSync={handleScrollCallback}>
                <ReactTableFixedColumns
                    TheadComponent={component => {
                        return (
                            <ScrollSyncPane group="one">
                                <div
                                    ref={scrollContainerHead}
                                    className="disable-scrollbars"
                                    style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}
                                >
                                    <div className={`comparison-thead ${component.className}`} style={component.style}>
                                        {component.children}
                                    </div>
                                </div>
                            </ScrollSyncPane>
                        );
                    }}
                    TbodyComponent={component => {
                        return (
                            <ScrollSyncPane group="one">
                                {/* paddingBottom for the 'add value' bottom, which is positioned partially below the table */}
                                <div style={{ overflow: 'auto', paddingBottom: 10 }}>
                                    {' '}
                                    {/*ref={props.scrollContainerBody}  */}
                                    <div className={`rt-tbody ${component.className}`} style={component.style}>
                                        {component.children}
                                    </div>
                                </div>
                            </ScrollSyncPane>
                        );
                    }}
                    getProps={() => customProps}
                    resizable={false}
                    sortable={false}
                    pageSize={data.length}
                    data={data}
                    columns={columns}
                    style={{
                        height: 'max-content' // This will force the table body to overflow and scroll, since there is not enough room
                    }}
                    showPagination={false}
                />
            </ScrollSync>
        </ReactTableWrapper>
    );
};

EditorTable.propTypes = {
    data: PropTypes.object
};

export default memo(EditorTable, compareProps);
