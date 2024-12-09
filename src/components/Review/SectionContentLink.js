import { Cite } from '@citation-js/core';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import SectionComparison from 'components/Review/SectionComparison';
import SectionVisualization from 'components/Review/SectionVisualization';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { groupBy, uniq } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate, getStatementsBySubjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { createReference, createSection, updateSectionLink } from 'slices/reviewSlice';
import { addAuthorsToStatements, getPaperData } from 'utils';

const SectionContentLink = (props) => {
    const dispatch = useDispatch();
    const [shouldShowOntologyAlert, setShouldShowOntologyAlert] = useState(false);
    const references = useSelector((state) => state.review.references);
    const contributionId = useSelector((state) => state.review.contributionId);

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
            value: objectId,
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
        setStatementBrowserKey((current) => ++current);
        setShouldShowOntologyAlert(true);
        dispatch(
            updateSectionLink({
                id: props.section.id,
                objectId: id,
                label,
            }),
        );

        if (props.type === 'comparison') {
            // paper metadata is needed to add it automatically to the reference list
            getPaperMetadataFromComparison(id);
        }
    };

    // it requires quite a lot of requests to get the metadata of the papers used in a comparison
    const getPaperMetadataFromComparison = async (comparisonId) => {
        const contributionStatements = await getStatementsBySubjectAndPredicate({
            subjectId: comparisonId,
            predicateId: PREDICATES.COMPARE_CONTRIBUTION,
        });
        const contributionIds = contributionStatements.map((statement) => statement.object.id);
        const paperStatementsPromises = contributionIds.map((contributionId) =>
            getStatementsByObjectAndPredicate({ predicateId: PREDICATES.HAS_CONTRIBUTION, objectId: contributionId }),
        );
        const paperStatements = (await Promise.all(paperStatementsPromises)).flatMap((statement) => statement);
        const paperIds = uniq(paperStatements.map((statement) => statement.subject.id));
        const statementsByPaper = groupBy(
            (await getStatementsBySubjects({ ids: paperIds })).flatMap(({ statements }) => statements),
            'subject.id',
        );
        for (const statements of Object.values(statementsByPaper)) {
            const statementsWithAuthors = await addAuthorsToStatements(statements);
            const paper = statements[0]?.subject;
            if (paper) {
                const paperData = getPaperData(paper, statementsWithAuthors);
                const bibJson = {
                    id: paperData.id,
                    title: paperData.label,
                    author: paperData.authors?.map((author) => ({ name: author.label })),
                    year: paperData.publicationYear?.label,
                };
                const parsedReference = await Cite.async(bibJson);
                const parsedReferenceData = parsedReference?.data?.[0];
                if (!parsedReferenceData) {
                    continue;
                }
                parsedReferenceData['citation-label'] = paper.id;
                const bibtex = parsedReference.format('bibtex'); // use the paper ID as key, so we can identify it to add in the _usedReferences later
                parsedReferenceData.id = paper.id; // set citation-label, later used to get the citation key
                const isExistingReference = references.find((reference) => reference?.parsedReference?.id === paper.id);
                if (!isExistingReference) {
                    dispatch(createReference({ contributionId, bibtex, parsedReference: parsedReferenceData }));
                }
            }
        }
    };

    const handleAddOntologySection = () => {
        setShouldShowOntologyAlert(false);
        dispatch(
            createSection({
                afterIndex: props.index,
                contributionId,
                sectionType: 'ontology',
            }),
        );
        toast.success('Ontology section has been added successfully below the comparison');
        // TODO: somehow populate the just added section with properties from the comparison...
        // due to the data flow structure, this is not so straightforward
    };

    const entityType = props.type === 'property' ? ENTITIES.PREDICATE : ENTITIES.RESOURCE;
    const hasValue = selectedResource && selectedResource?.value;
    let optionsClasses = [];

    if (props.type === 'comparison') {
        optionsClasses = [CLASSES.COMPARISON_PUBLISHED];
    } else if (props.type === 'visualization') {
        optionsClasses = [CLASSES.VISUALIZATION];
    }

    return (
        <div>
            <SelectGlobalStyle />
            <Autocomplete
                excludeClasses={
                    props.type === 'resource'
                        ? [
                              CLASSES.PAPER,
                              CLASSES.CONTRIBUTION,
                              CLASSES.NODE_SHAPE,
                              CLASSES.RESEARCH_FIELD,
                              CLASSES.PROPERTY_SHAPE,
                              CLASSES.PAPER_DELETED,
                              CLASSES.CONTRIBUTION_DELETED,
                          ]
                        : []
                }
                entityType={entityType}
                includeClasses={optionsClasses}
                placeholder={`Select a ${props.type}`}
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={props.type === 'resource'} // only allow create for resources
            />
            {(props.type === 'resource' || props.type === 'property') && hasValue && (
                <DataBrowser isEditMode id={selectedResource.value} key={selectedResource.value} />
            )}
            {props.type === 'comparison' && hasValue && (
                <>
                    <Alert color="info" className="my-3" isOpen={shouldShowOntologyAlert} toggle={() => setShouldShowOntologyAlert(false)}>
                        Do you want to add an ontology section for this comparison?{' '}
                        <Button color="link" className="p-0" onClick={handleAddOntologySection}>
                            Add section
                        </Button>
                    </Alert>
                    <SectionComparison id={selectedResource.value} sectionId={props.section.id} />
                </>
            )}
            {props.type === 'visualization' && hasValue && <SectionVisualization id={selectedResource.value} />}
        </div>
    );
};

SectionContentLink.propTypes = {
    section: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
};

export default SectionContentLink;
