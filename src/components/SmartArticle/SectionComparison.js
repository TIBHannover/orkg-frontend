import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import Comparison from 'components/Comparison/Comparison';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import React from 'react';

const SectionComparison = ({ id }) => {
    const { contributions, properties, data, isLoadingComparisonResult, filterControlData, updateRulesOfProperty } = useComparison({ id });

    return (
        <>
            {id && contributions.length > 0 && (
                <Comparison
                    data={data}
                    properties={properties}
                    contributions={contributions}
                    removeContribution={() => {}}
                    transpose={false}
                    viewDensity="compact"
                    filterControlData={filterControlData}
                    updateRulesOfProperty={updateRulesOfProperty}
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
