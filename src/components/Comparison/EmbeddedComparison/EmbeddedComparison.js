import { useEffect } from 'react';
import Comparison from 'components/Comparison/Comparison';
import useComparison from 'components/Comparison/hooks/useComparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import PropTypes from 'prop-types';

const EmbeddedComparison = (props) => {
    const { isLoadingResult, data, contributions, comparisonResource, properties } = useComparison({
        id: props.id,
        isEmbeddedMode: true,
    });

    useEffect(() => {
        if (!isLoadingResult) {
            props.updateReferences(contributions);
            props.setComparisonDataCallBack({ data, properties, metaData: comparisonResource });
        }
    }, [comparisonResource, contributions, data, isLoadingResult, properties, props]);
    return (
        <>
            {props.id && !isLoadingResult && contributions.length > 0 && <Comparison />}
            {props.id && isLoadingResult && <ComparisonLoadingComponent />}
        </>
    );
};

EmbeddedComparison.propTypes = {
    id: PropTypes.string,
    updateReferences: PropTypes.func,
    setComparisonDataCallBack: PropTypes.func,
};

export default EmbeddedComparison;
