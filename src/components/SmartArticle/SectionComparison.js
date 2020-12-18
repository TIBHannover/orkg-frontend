import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/ComparisonTable';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import React from 'react';

const SectionComparison = ({ id }) => {
    const { contributions, properties, data, isLoadingComparisonResult } = useComparison({ id });

    return (
        <>
            {id && contributions.length > 0 && (
                <ComparisonTable
                    data={data}
                    properties={properties}
                    contributions={contributions}
                    removeContribution={() => {}}
                    transpose={false}
                    viewDensity="compact"
                />
            )}
            {id && isLoadingComparisonResult && <ComparisonLoadingComponent />}
        </>
    );
};

SectionComparison.propTypes = {
    id: PropTypes.string.isRequired
};

export default SectionComparison;
