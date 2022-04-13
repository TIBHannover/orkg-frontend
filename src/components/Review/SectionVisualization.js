import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import { PREDICATES } from 'constants/graphSettings';
import Visualization from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getVisualization } from 'services/similarity';

const SectionVisualization = ({ id }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const statements = useSelector(state => state.review.statements);
    const description = statements.find(statement => statement.subject.id === id && statement.predicate.id === PREDICATES.DESCRIPTION)?.object.label;

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            const _data = await getVisualization(id);
            setData(_data);
            setIsLoading(false);
        };
        getData();
    }, [id]);

    return (
        <>
            {id && data && !isLoading && (
                <>
                    <Visualization model={data} />
                    {/* Add the description for screen readers */}
                    <p hidden>{description}</p>
                </>
            )}
            {id && isLoading && <ComparisonLoadingComponent />}
        </>
    );
};

SectionVisualization.propTypes = {
    id: PropTypes.string.isRequired
};

export default SectionVisualization;
