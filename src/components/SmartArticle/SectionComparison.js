import { updateSectionLink } from 'actions/smartArticle';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ComparisonTable from 'components/Comparison/ComparisonTable';
import useComparison from 'components/Comparison/hooks/useComparison';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';

const SectionComparison = ({ id }) => {
    const { contributions, properties, data } = useComparison({ id });
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
                //id: props.section.id,
                objectId: id,
                label
            })
        );
    };

    return (
        <>
            <Autocomplete
                requestUrl="resource"
                optionsClass={CLASSES.COMPARISON}
                placeholder="Search for a comparison"
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                autoFocus={false}
                cssClasses="mb-2"
            />
            {id && contributions.length && (
                <ComparisonTable
                    data={data}
                    properties={properties}
                    contributions={contributions}
                    removeContribution={() => {}}
                    transpose={false}
                    viewDensity="compact"
                />
            )}
        </>
    );
};

SectionComparison.propTypes = {
    id: PropTypes.object
};

SectionComparison.defaultProps = {
    id: null
};

export default SectionComparison;
