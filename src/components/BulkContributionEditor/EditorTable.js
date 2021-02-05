import TableCell from 'components/BulkContributionEditor/TableCell';
import TableHeaderColumn from 'components/BulkContributionEditor/TableHeaderColumn';
import TableHeaderRow from 'components/BulkContributionEditor/TableHeaderRow';
import { Properties, PropertiesInner, ReactTableWrapper } from 'components/Comparison/styled';
import { functions, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useRef } from 'react';
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
                Cell: cell => <TableHeaderRow property={cell.value} />,
                width: 250
            },
            ...Object.keys(props.data.contributions).map((contributionId, i) => {
                const contribution = props.data.contributions[contributionId];
                return {
                    id: contribution.id,
                    Header: () => <TableHeaderColumn contribution={contribution} key={contribution.id} />,
                    accessor: d => d.values[i],
                    Cell: cell => <TableCell values={cell.value} />,
                    width: 250
                };
            })
        ];
    }

    const handleScrollCallback = () => {};

    const TheadComponent = component => (
        <ScrollSyncPane group="one">
            <div ref={scrollContainerHead} className="disable-scrollbars" style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}>
                <div className={`comparison-thead ${component.className}`} style={component.style}>
                    {component.children}
                </div>
            </div>
        </ScrollSyncPane>
    );

    const TbodyComponent = component => (
        <ScrollSyncPane group="one">
            {/* paddingBottom for the 'add value' bottom, which is positioned partially below the table */}
            <div style={{ overflow: 'auto', paddingBottom: 15 }}>
                {' '}
                {/*ref={props.scrollContainerBody}  */}
                <div className={`rt-tbody ${component.className}`} style={component.style}>
                    {component.children}
                </div>
            </div>
        </ScrollSyncPane>
    );

    return (
        <ReactTableWrapper className="bulk-editor">
            <ScrollSync onSync={handleScrollCallback}>
                <ReactTableFixedColumns
                    TheadComponent={TheadComponent}
                    TbodyComponent={TbodyComponent}
                    getProps={() => customProps}
                    resizable={false}
                    sortable={false}
                    pageSize={data.length}
                    data={data}
                    columns={columns}
                    style={{
                        height: 'max-content'
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
