import { createSection, updateSectionLink } from 'actions/smartReview';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import SectionComparison from 'components/SmartReview/SectionComparison';
import SectionVisualization from 'components/SmartReview/SectionVisualization';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import { createResource } from 'services/backend/resources';

const SectionContentLink = props => {
    const dispatch = useDispatch();
    const [shouldShowOntologyAlert, setShouldShowOntologyAlert] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const contributionId = useSelector(state => state.smartReview.contributionId);

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
        setShouldShowOntologyAlert(true);
        dispatch(
            updateSectionLink({
                id: props.section.id,
                objectId: id,
                label
            })
        );
    };

    const handleAddOntologySection = () => {
        setShouldShowOntologyAlert(false);
        dispatch(
            createSection({
                afterIndex: props.index,
                contributionId,
                sectionType: 'ontology'
            })
        );
        toast.success('Ontology section has been added successfully below the comparison');
        // TODO: somehow populate the just added section with properties from the comparison...
        // due to the data flow structure, this is not so straightforward
    };

    const entityType = props.type === 'property' ? ENTITIES.PREDICATE : ENTITIES.RESOURCE;
    const hasValue = selectedResource && selectedResource?.value;
    let optionsClass = undefined;

    if (props.type === 'comparison') {
        optionsClass = CLASSES.COMPARISON;
    } else if (props.type === 'visualization') {
        optionsClass = CLASSES.VISUALIZATION;
    }

    return (
        <div>
            <Autocomplete
                excludeClasses={
                    props.type === 'resource' ? `${CLASSES.PAPER},${CLASSES.CONTRIBUTION},${CLASSES.TEMPLATE},${CLASSES.RESEARCH_FIELD}` : undefined
                }
                entityType={entityType}
                optionsClass={optionsClass}
                placeholder={`Select a ${props.type}`}
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={props.type === 'resource'} // only allow create for resources
                autoFocus={false}
                cssClasses="mb-2"
                classNamePrefix="react-select"
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
            {props.type === 'comparison' && hasValue && (
                <>
                    <Alert color="info" className="my-3" isOpen={shouldShowOntologyAlert} toggle={() => setShouldShowOntologyAlert(false)}>
                        Do you want to add an ontology section for this comparison?{' '}
                        <Button color="link" className="p-0" onClick={handleAddOntologySection}>
                            Add section
                        </Button>
                    </Alert>
                    <SectionComparison id={selectedResource.value} />
                </>
            )}
            {props.type === 'visualization' && hasValue && <SectionVisualization id={selectedResource.value} />}
        </div>
    );
};

SectionContentLink.propTypes = {
    section: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired
};

export default SectionContentLink;
