import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import Visualization from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { getVisualization } from 'services/similarity';

const SectionVisualization = ({ id }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
            {id && data && !isLoading && <Visualization model={data} />}
            {id && isLoading && <ComparisonLoadingComponent />}
        </>
    );
};

SectionVisualization.propTypes = {
    id: PropTypes.string.isRequired
};

export default SectionVisualization;
