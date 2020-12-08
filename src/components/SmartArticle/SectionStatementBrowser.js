import Autocomplete from 'components/Autocomplete/Autocomplete';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { resourcesUrl, createResource } from 'services/backend/resources';
import { updateSectionLink } from 'actions/smartArticle';
import { useDispatch } from 'react-redux';

const SectionStatementBrowser = props => {
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

    return (
        <div>
            <Autocomplete
                requestUrl={resourcesUrl}
                //optionsClass={CLASSES.RESEARCH_FIELD}
                placeholder="Enter a resource"
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={true}
                autoFocus={false}
                cssClasses="mb-2"
            />
            {selectedResource && selectedResource?.value && (
                <StatementBrowser
                    enableEdit={true}
                    syncBackend={true}
                    openExistingResourcesInDialog={false}
                    initialResourceId={selectedResource.value}
                    initialResourceLabel="Main"
                    newStore={true}
                    key={statementBrowserKey}
                />
            )}
        </div>
    );
};

SectionStatementBrowser.propTypes = {
    section: PropTypes.object.isRequired
};

export default SectionStatementBrowser;
