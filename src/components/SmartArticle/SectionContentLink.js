import { updateSectionLink } from 'actions/smartArticle';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import SectionComparison from 'components/SmartArticle/SectionComparison';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { predicatesUrl } from 'services/backend/predicates';
import { createResource, resourcesUrl } from 'services/backend/resources';

const SectionContentLink = props => {
    const dispatch = useDispatch();

    const [selectedResource, setSelectedResource] = useState(null);

    useEffect(() => {
        if (!props.section.contentLink) {
            return;
        }
        const { label, objectId } = props.section.contentLink;

        // only run on mount
        if (!objectId || selectedResource) {
            return;
        }
        setSelectedResource({
            label,
            value: objectId
        });
    }, [props.section.contentLink, selectedResource]);

    // by updating the key of the statement browser, we can force a destroying the component and recreating it
    const [statementBrowserKey, setStatementBrowserKey] = useState(0);

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
        setStatementBrowserKey(current => ++current);

        dispatch(
            updateSectionLink({
                id: props.section.id,
                objectId: id,
                label
            })
        );
    };

    const requestUrl = props.type === 'property' ? predicatesUrl : resourcesUrl;
    const hasValue = selectedResource && selectedResource?.value;

    return (
        <div>
            <Autocomplete
                requestUrl={requestUrl}
                optionsClass={props.type === 'comparison' ? CLASSES.COMPARISON : undefined}
                placeholder={`Enter a ${props.type}`}
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={props.type === 'resource'} // only allow create for resources
                autoFocus={false}
                cssClasses="mb-2"
            />
            {(props.type === 'resource' || props.type === 'property') && hasValue && (
                <StatementBrowser
                    enableEdit={true}
                    syncBackend={true}
                    openExistingResourcesInDialog={false}
                    initialSubjectId={selectedResource.value}
                    initialSubjectLabel="Main"
                    newStore={true}
                    key={statementBrowserKey}
                    rootNodeType={props.type === 'resource' ? 'resource' : 'predicate'}
                />
            )}
            {props.type === 'comparison' && hasValue && <SectionComparison id={selectedResource.value} />}
        </div>
    );
};

SectionContentLink.propTypes = {
    section: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
};

export default SectionContentLink;
