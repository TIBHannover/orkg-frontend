import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Properties, PropertiesInner } from '@/components/Comparison/styled';
import ContributionCell from '@/components/Comparison/Table/Cells/ContributionCell';
import PropertyCell from '@/components/Comparison/Table/Cells/PropertyCell';
import { getCellPadding } from '@/slices/comparisonSlice';

const RowHeader = ({ cell, property }) => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const cellPadding = useSelector(getCellPadding);

    return (
        <Properties className={`${!transpose ? 'columnProperty' : 'columnContribution'} ${cell.group ? 'columnPropertyGroup' : ''}`}>
            <PropertiesInner
                className={`${!transpose ? 'd-flex flex-row align-items-start justify-content-between' : ''}`}
                cellPadding={cellPadding}
                transpose={transpose}
            >
                {!transpose ? (
                    <PropertyCell
                        similar={cell.similar}
                        label={cell.label}
                        id={cell.id}
                        group={cell.group ?? false}
                        grouped={cell.grouped ?? false}
                        groupId={cell.groupId ?? null}
                        property={property}
                    />
                ) : (
                    <ContributionCell contribution={cell} />
                )}
            </PropertiesInner>
        </Properties>
    );
};

RowHeader.propTypes = {
    cell: PropTypes.object.isRequired,
    property: PropTypes.object,
};

export default RowHeader;
