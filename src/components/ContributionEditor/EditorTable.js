import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import PropTypes from 'prop-types';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';
import { useFlexLayout, useTable } from 'react-table';
import { useSticky } from 'react-table-sticky';

const EditorTable = ({ scrollContainerBody }) => {
    const { contributions, papers, statements, properties, resources, literals } = useSelector(state => state.contributionEditor);
    const { generateTableMatrix } = useContributionEditor();
    const { data, columns } = useMemo(() => generateTableMatrix({ contributions, papers, statements, properties, resources, literals }), [
        contributions,
        generateTableMatrix,
        literals,
        papers,
        properties,
        resources,
        statements
    ]);

    const defaultColumn = useMemo(
        () => ({
            minWidth: 300,
            width: 1,
            maxWidth: 2
        }),
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
            defaultColumn
        },
        useFlexLayout,
        useSticky
    );

    return (
        <div role="table" id="comparisonTable" {...getTableProps()} className="table sticky mb-0" style={{ height: 'max-content' }}>
            <ScrollSyncPane group="one">
                <div style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }} className="disable-scrollbars">
                    {headerGroups.map(headerGroup => (
                        <div className="header" {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <div {...column.getHeaderProps()} className="th">
                                    {column.render('Header')}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </ScrollSyncPane>
            <ScrollSyncPane group="one">
                {/* paddingBottom for the 'add value' bottom, which is positioned partially below the table */}
                <div ref={scrollContainerBody} style={{ overflow: 'auto', paddingBottom: 15 }}>
                    <div {...getTableBodyProps()} className="comparisonBody" style={{ width: '100%' }}>
                        {rows.map((row, i) => {
                            prepareRow(row);
                            return (
                                <div {...row.getRowProps()} className="tr">
                                    {row.cells.map(cell => {
                                        return (
                                            <div {...cell.getCellProps()} className="td">
                                                {cell.render('Cell')}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollSyncPane>
        </div>
    );
};

EditorTable.propTypes = {
    data: PropTypes.object,
    scrollContainerBody: PropTypes.object.isRequired
};

export default memo(EditorTable);
