import { cloneDeep, omit } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';
import { useFlexLayout, useTable } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { useMedia } from 'react-use';

import { DEFAULT_COLUMN_WIDTH } from '@/components/Comparison/ComparisonHeader/ColumnWidth';
import { getPropertyObjectFromData, groupArrayByDirectoryPrefix } from '@/components/Comparison/hooks/helpers';
import { ReactTableWrapper } from '@/components/Comparison/styled';
import ColumnHeader from '@/components/Comparison/Table/Cells/ColumnHeader/ColumnHeader';
import ColumnHeaderFirstColumn from '@/components/Comparison/Table/Cells/ColumnHeader/ColumnHeaderFirstColumn';
import RowHeader from '@/components/Comparison/Table/Cells/RowHeader/RowHeader';
import TableCell from '@/components/Comparison/Table/Cells/TableCell';
import HeaderRow from '@/components/Comparison/Table/Rows/HeaderRow';
import Rows from '@/components/Comparison/Table/Rows/Rows';
import Alert from '@/components/Ui/Alert/Alert';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

const ComparisonTable = (props) => {
    const filterControlData = useSelector((state) => state.comparison.filterControlData);
    const data = useSelector((state) => state.comparison.data);
    const properties = useSelector((state) => state.comparison.properties);
    const contributions = useSelector((state) => state.comparison.contributions);
    const viewDensity = useSelector((state) => state.comparison.configuration.viewDensity);
    const columnWidth = useSelector((state) => state.comparison.configuration.columnWidth);
    const comparisonType = useSelector((state) => state.comparison.configuration.comparisonType);
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const hiddenGroups = useSelector((state) => state.comparison.hiddenGroups ?? []);
    const { isEditMode } = useIsEditMode();

    const scrollContainerHead = useRef(null);
    const smallerFontSize = viewDensity === 'compact';
    const isSmallScreen = useMedia('(max-width: 576px)');

    const tableData = useMemo(() => {
        let dataFrame = [
            ...(!transpose
                ? properties
                      .filter((property) => property.active && data[property.id])
                      .map((property) => ({
                          property,
                          values: contributions.map((contribution, index2) => {
                              const _data = cloneDeep(data?.[property.id] ? data[property.id]?.[index2] : null);
                              return _data?.sort((a, b) => a?.label?.localeCompare(b?.label));
                          }),
                      }))
                : contributions.map((contribution, index) => ({
                      property: contribution,
                      values: properties
                          .filter((property) => property.active)
                          .map((property) => {
                              const _data = cloneDeep(data[property.id] ? data[property.id]?.[index] : null);
                              return _data?.sort((a, b) => a?.label?.localeCompare(b?.label));
                          }),
                  }))),
        ];
        if (!transpose && comparisonType === 'PATH' && !isEditMode) {
            let groups = omit(groupArrayByDirectoryPrefix(dataFrame.map((dO) => dO.property.id)), '');
            groups = Object.keys(groups);
            const shownGroups = [];
            groups.map((key) => {
                const labels = dataFrame.map((dO) => dO.property.label);
                let index = 0;
                let found = false;
                labels.map((l, i) => {
                    if (!found && l.startsWith(key) && !labels.includes(key)) {
                        index = i;
                        found = true;
                        shownGroups.push(key);
                    }
                    return null;
                });
                // find where to place the header
                if (found) {
                    dataFrame.splice(index, 0, { property: { id: null, label: key, similar: [], group: true, groupId: key }, values: [] });
                }
                return null;
            });
            shownGroups
                .sort((a, b) => b.length - a.length)
                .map((key) => {
                    dataFrame = dataFrame.map((row) => {
                        if (row.property.label.startsWith(key)) {
                            return {
                                values: row.values,
                                property: { ...row.property, label: row.property.label.replace(`${key}/`, ''), grouped: true, inGroupId: key },
                            };
                        }
                        return row;
                    });
                    return null;
                });
            dataFrame = dataFrame.filter((row) => !hiddenGroups.includes(row.property.inGroupId) || row.property.group);
        }
        return dataFrame;
    }, [comparisonType, contributions, data, properties, hiddenGroups, transpose, isEditMode]);

    const columns = useMemo(() => {
        if (filterControlData.length === 0) {
            return [];
        }
        return [
            // first column (header with properties, if transposed: contributions)
            {
                Header: () => <ColumnHeaderFirstColumn />,
                accessor: 'property',
                Cell: (cell) => <RowHeader cell={cell.value} property={getPropertyObjectFromData(data, cell.value)} />,
                sticky: !isSmallScreen ? 'left' : undefined,
                minWidth: DEFAULT_COLUMN_WIDTH,
            },
            // remaining columns
            ...(!transpose ? contributions : properties.filter((property) => property.active && data[property.id]))
                .map((headerData, index) => {
                    if (headerData.active) {
                        return {
                            id: headerData.id,
                            Header: (column) => (
                                <ColumnHeader
                                    index={column.index}
                                    headerData={headerData}
                                    columnId={column.column.id}
                                    columnStyle={column.column.getHeaderProps()?.style}
                                    property={getPropertyObjectFromData(data, headerData)}
                                    instanceId={column.instanceId}
                                    totalColumns={column.totalColumns}
                                />
                            ),
                            accessor: (d) => d.values[index],
                            Cell: (cell) => <TableCell entities={cell.value} />,
                        };
                    }
                    return null;
                })
                .filter(Boolean),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps -- columnWidth should be included to ensure that the table is re-rendered when the column width changes
    }, [comparisonType, contributions, data, filterControlData.length, isSmallScreen, properties, transpose, columnWidth]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: tableData,
            defaultColumn: {
                minWidth: columnWidth ? parseInt(columnWidth, 10) : 250,
                width: 1,
                maxWidth: 2,
            },
        },
        useFlexLayout,
        useSticky,
    );

    return (
        <ReactTableWrapper>
            <div
                {...getTableProps()}
                id="comparisonTable"
                className="table sticky mb-0 p-0"
                style={{ height: 'max-content', fontSize: smallerFontSize ? '0.95rem' : '1rem' }}
            >
                <ScrollSyncPane group="comparison-table" attachTo={scrollContainerHead}>
                    <HeaderRow scrollContainerHead={scrollContainerHead} headerGroups={headerGroups} />
                </ScrollSyncPane>
                <ScrollSyncPane group="comparison-table" attachTo={props.scrollContainerBody}>
                    <Rows rows={rows} scrollContainerBody={props.scrollContainerBody} getTableBodyProps={getTableBodyProps} prepareRow={prepareRow} />
                </ScrollSyncPane>
            </div>
            {rows.length === 0 && (
                <Alert className="mt-3" color="info">
                    These contributions have no data to compare on!
                </Alert>
            )}
        </ReactTableWrapper>
    );
};

ComparisonTable.propTypes = {
    scrollContainerBody: PropTypes.object.isRequired,
};

export default memo(ComparisonTable);
