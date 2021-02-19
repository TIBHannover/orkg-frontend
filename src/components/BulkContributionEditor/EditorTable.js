import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import PropTypes from 'prop-types';
import { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ScrollSyncPane } from 'react-scroll-sync';
import ReactTable from 'react-table';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css';

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

const EditorTable = ({ scrollContainerBody }) => {
    const { contributions, papers, statements, properties, resources, literals } = useSelector(state => state.bulkContributionEditor);
    const { generateTableMatrix } = useBulkContributionEditor();
    const { data, columns } = generateTableMatrix({ contributions, papers, statements, properties, resources, literals });

    const TheadComponent = component => (
        <ScrollSyncPane group="one">
            <div className="disable-scrollbars" style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}>
                <div className={`comparison-thead ${component.className}`} style={component.style}>
                    {component.children}
                </div>
            </div>
        </ScrollSyncPane>
    );

    // useCallback to ensure the scroll position is preserved when the data is updating
    const TbodyComponent = useCallback(
        component => (
            <ScrollSyncPane group="one">
                {/* paddingBottom for the 'add value' bottom, which is positioned partially below the table */}
                <div style={{ overflow: 'auto', paddingBottom: 15 }} ref={scrollContainerBody}>
                    <div className={`rt-tbody ${component.className}`} style={component.style}>
                        {component.children}
                    </div>
                </div>
            </ScrollSyncPane>
        ),
        [scrollContainerBody]
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
