import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import TableCell from 'components/BulkContributionEditor/TableCell';
import TableHeaderColumn from 'components/BulkContributionEditor/TableHeaderColumn';
import TableHeaderRow from 'components/BulkContributionEditor/TableHeaderRow';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';
import ReactTable from 'react-table';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css';

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

const EditorTable = ({ scrollContainerBody }) => {
    const { contributions, papers, statements, properties, resources, literals } = useSelector(state => state.bulkContributionEditor);
    const { getStatementsByPropertyIdAndContributionId } = useBulkContributionEditor();

    const statementsByPropertyIdAndContributionId = getStatementsByPropertyIdAndContributionId(statements);

    let data = [];
    let columns = [];

    if (Object.keys(statements).length) {
        data = Object.keys(properties).map(propertyId => ({
            property: properties[propertyId],
            values: Object.keys(contributions).map(
                contributionId =>
                    sortBy(
                        statementsByPropertyIdAndContributionId?.[propertyId]?.[contributionId]?.map(statementId => ({
                            ...(statements[statementId].type === 'resource'
                                ? resources[statements[statementId].objectId]
                                : literals[statements[statementId].objectId]),
                            statementId
                        })),
                        value => value?.label?.trim().toLowerCase()
                    ) || [{}]
            )
        }));

        data = sortBy(data, date => date.property.label.trim().toLowerCase());

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
            ...Object.keys(contributions).map((contributionId, i) => {
                const contribution = contributions[contributionId];
                return {
                    id: contributionId,
                    Header: () => <TableHeaderColumn contribution={contribution} paper={papers[contribution.paperId]} key={contributionId} />,
                    accessor: d => d.values[i],
                    Cell: cell => <TableCell values={cell.value} contributionId={cell.column.id} propertyId={cell.row.property.id} />,
                    width: 250
                };
            })
        ];
    }

    const TheadComponent = component => (
        <ScrollSyncPane group="one">
            <div className="disable-scrollbars" style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}>
                <div className={`comparison-thead ${component.className}`} style={component.style}>
                    {component.children}
                </div>
            </div>
        </ScrollSyncPane>
    );

    const TbodyComponent = component => (
        <ScrollSyncPane group="one">
            {/* paddingBottom for the 'add value' bottom, which is positioned partially below the table */}
            <div style={{ overflow: 'auto', paddingBottom: 15 }} ref={scrollContainerBody}>
                <div className={`rt-tbody ${component.className}`} style={component.style}>
                    {component.children}
                </div>
            </div>
        </ScrollSyncPane>
    );

    return (
        <ReactTableFixedColumns
            TheadComponent={TheadComponent}
            TbodyComponent={TbodyComponent}
            getProps={() => ({ id: 'comparisonTable' })}
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
    );
};

EditorTable.propTypes = {
    data: PropTypes.object,
    scrollContainerBody: PropTypes.object.isRequired
};

export default memo(EditorTable);
