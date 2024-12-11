import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import { PREDICATES } from 'constants/graphSettings';
import THING_TYPES from 'constants/thingTypes';
import Visualization from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getThing } from 'services/simcomp';

const SectionVisualization = ({ id }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const statements = useSelector((state) => state.review.statements);
    const description = statements.find((statement) => statement.subject.id === id && statement.predicate.id === PREDICATES.DESCRIPTION)?.object
        .label;

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            const _data = await getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: id });
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
    id: PropTypes.string.isRequired,
};

export default SectionVisualization;
