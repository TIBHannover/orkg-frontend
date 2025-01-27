import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useReview from 'components/Review/hooks/useReview';
import THING_TYPES from 'constants/thingTypes';
import Visualization from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { FC } from 'react';
import { getThing, simCompServiceUrl } from 'services/simcomp';
import useSWR from 'swr';

type SectionVisualizationProps = {
    id?: string;
    label?: string;
};

const SectionVisualization: FC<SectionVisualizationProps> = ({ id, label }) => {
    const { review } = useReview();

    const { data, isLoading } = useSWR(
        id ? [{ thingType: THING_TYPES.VISUALIZATION, thingKey: id }, simCompServiceUrl, 'getThing'] : null,
        ([params]) =>
            // @ts-expect-error awaiting migration simcomp
            getThing(params),
    );

    if (!review) {
        return null;
    }

    return (
        <>
            {id && data && !isLoading && (
                <>
                    <Visualization model={data} />
                    {/* Add the description for screen readers */}
                    <p hidden>{label}</p>
                </>
            )}
            {id && isLoading && <ComparisonLoadingComponent />}
        </>
    );
};

export default SectionVisualization;
