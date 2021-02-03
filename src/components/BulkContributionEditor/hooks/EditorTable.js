import { memo, useRef } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropertyValue from 'components/Comparison/PropertyValue';
import ROUTES from 'constants/routes';
import { functions, isEqual, omit } from 'lodash';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { ScrollSyncPane } from 'react-scroll-sync';
import ReactTable from 'react-table';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import
import { Contribution, Delete, ItemHeader, ItemHeaderInner, Properties, PropertiesInner } from './styled';
import TableCell from './TableCell';
import PropTypes from 'prop-types';

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

const compareProps = (prevProps, nextProps) => {
    // remove functions from equality check (mainly targeting "removeContribution"), otherwise it is always false
    return isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps)));
};

const ComparisonTable = props => {
    const scrollContainerHead = useRef(null);
    const customProps = { id: 'comparisonTable' };


    return (
        <ReactTableFixedColumns
            TheadComponent={component => {
               
            }}
            TbodyComponent={component => {
               
            }}
            getProps={() => customProps}
            resizable={false}
            sortable={false}
            pageSize={}
            data={}
            columns={}
            style={{
                height: 'max-content', // This will force the table body to overflow and scroll, since there is not enough room
                fontSize: smallerFontSize ? '0.95rem' : '1rem'
            }}
            showPagination={false}
        />
    );
};

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    removeContribution: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact']),
    scrollContainerBody: PropTypes.object.isRequired
};

export default memo(ComparisonTable, compareProps);
