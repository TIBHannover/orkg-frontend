import { setComparisonData } from 'actions/smartReview';
import Comparison from 'components/Comparison/Comparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const SectionComparison = ({ id }) => {
    const comparisonData = useComparison({
        id
    });
    const { contributions, properties, data, isLoadingComparisonResult, filterControlData, updateRulesOfProperty, comparisonType } = comparisonData;
    const dispatch = useDispatch();

    useEffect(() => {
        if (Object.keys(comparisonData.data).length === 0) {
            return;
        }
        dispatch(
            setComparisonData({
                id,
                data: comparisonData
            })
        );
    }, [comparisonData, dispatch, id]);

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
                    comparisonType={comparisonType}
                    filterControlData={filterControlData}
                    updateRulesOfProperty={updateRulesOfProperty}
                    embeddedMode={true}
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
