import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import { Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';
import { useFlexLayout, useTable } from 'react-table';
import { useSticky } from 'react-table-sticky';
import FlipMove from 'react-flip-move';

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
        <>
            <SBEditorHelpModal />
            <div role="table" id="comparisonTable" {...getTableProps()} className="table sticky mb-0 p-0" style={{ height: 'max-content' }}>
                <ScrollSyncPane group="one">
                    <div style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }} className="disable-scrollbars">
                        {headerGroups.map(headerGroup => (
                            <div className="header" {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <div {...column.getHeaderProps()} className="th p-0">
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
                        <div {...getTableBodyProps()} className="comparisonBody" style={{ ...getTableProps().style }}>
                            <FlipMove duration={700} enterAnimation="accordionVertical" leaveAnimation="accordionVertical" className="p-0">
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <div {...row.getRowProps()} className="tr d-flex p-0" style={{ zIndex: 100 - row.index }}>
                                            {row.cells.map(cell => (
                                                <div {...cell.getCellProps()} className="td p-0">
                                                    {cell.render('Cell')}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </FlipMove>
                        </div>
                    </div>
                    {rows.length === 0 && (
                        <Alert className="mt-0" color="info">
                            Start adding properties or use templates by using the buttons bellow!
                        </Alert>
                    )}
                </ScrollSyncPane>
            </div>
        </>
    );
};

EditorTable.propTypes = {
    data: PropTypes.object,
    scrollContainerBody: PropTypes.object.isRequired
};

export default memo(EditorTable);
