import { updateSectionLink } from 'actions/smartArticle';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ComparisonTable from 'components/Comparison/ComparisonTable';
import useComparison from 'components/Comparison/hooks/useComparison';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';

const SectionComparison = ({ id, sectionId, isEditable }) => {
    const { contributions, properties, data, isLoadingComparisonResult } = useComparison({ id });
    const [selectedResource, setSelectedResource] = useState(null);
    const dispatch = useDispatch();

    const handleItemSelected = async (selectedOption, { action }) => {
        const { label } = selectedOption;
        let { id } = selectedOption;

        if (action === 'create-option') {
            const newResource = await createResource(label);
            id = newResource.id;
        }

        if (!id) {
            return;
        }

        setSelectedResource({ value: id, label });

        dispatch(
            updateSectionLink({
                id: sectionId,
                objectId: id,
                label
            })
        );
    };

    return (
        <>
            {isEditable && (
                <Autocomplete
                    requestUrl="resource"
                    optionsClass={CLASSES.COMPARISON}
                    placeholder="Search for a comparison..."
                    onChange={handleItemSelected}
                    value={selectedResource}
                    openMenuOnFocus={false}
                    autoFocus={false}
                    cssClasses="mb-2"
                />
            )}
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
    isEditable: PropTypes.bool,
    id: PropTypes.string,
    sectionId: PropTypes.string
};

SectionComparison.defaultProps = {
    isEditable: false,
    id: null,
    sectionId: null
};

export default SectionComparison;
