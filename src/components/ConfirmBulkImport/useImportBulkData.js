import { useState, useCallback } from 'react';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { omit, isString } from 'lodash';
import { getStatementsBySubject } from 'services/backend/statements';
import { getPaperByDOI } from 'services/backend/misc';
import { getResourcesByClass } from 'services/backend/resources';
import { getResource } from 'services/backend/resources';
import { getPredicate, getAllPredicates, createPredicate } from 'services/backend/predicates';
import { saveFullPaper } from 'services/backend/papers';
import { toast } from 'react-toastify';

const PREDEFINED_COLUMNS = [
    'paper:title',
    'paper:authors',
    'paper:publication_month',
    'paper:publication_year',
    'paper:doi',
    'paper:research_field',
    'contribution:research_problem'
];

const useImportBulkData = ({ data, onFinish }) => {
    const [papers, setPapers] = useState([]);
    const [existingPaperIds, setExistingPaperIds] = useState([]);
    const [idToLabel, setIdToLabel] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [createdContributions, setCreatedContributions] = useState([]);

    const getFirstValue = (object, key, defaultValue = '') => {
        return key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue;
    };

    const makePaperList = useCallback(async () => {
        const _papers = [];
        const header = data[0];
        const rows = data.slice(1);
        const _existingPaperIds = [];
        // used to map resource/property IDs to their labels
        const _idToLabel = {};
        // used to map property values to their IDs (not the inverse of _idToLabel!)
        const valueToId = {};

        setIsLoading(true);

        for (const row of rows) {
            // make use of an array for cells, in case multiple columns exist with the same label
            let rowObject = {};
            for (const [index, headerItem] of header.entries()) {
                if (!(headerItem in rowObject)) {
                    rowObject[headerItem] = [];
                }
                rowObject[headerItem].push(row[index]);
            }

            const title = getFirstValue(rowObject, 'paper:title');
            const authors = getFirstValue(rowObject, 'paper:authors')
                .split(';')
                .map(name => ({ label: name }));
            const publicationMonth = getFirstValue(rowObject, 'paper:publication_month');
            const publicationYear = getFirstValue(rowObject, 'paper:publication_year');
            const doi = getFirstValue(rowObject, 'paper:doi');
            let researchField = getFirstValue(rowObject, 'paper:research_field', MISC.RESEARCH_FIELD_MAIN);
            const researchProblem = getFirstValue(rowObject, 'contribution:research_problem');

            rowObject = omit(rowObject, PREDEFINED_COLUMNS);

            const contributionStatements = {};

            // replace :orkg prefix in research field
            if (isString(researchField) && researchField.startsWith('orkg:')) {
                researchField = cleanLabel(researchField);
            }

            // add research problem
            if (researchProblem && isString(researchProblem)) {
                const problemObject = {};
                // Add mapping to research problem predicate
                _idToLabel[PREDICATES.HAS_RESEARCH_PROBLEM] = 'has research problem';
                if (researchProblem.startsWith('orkg:')) {
                    problemObject['@id'] = cleanLabel(researchProblem);
                } else {
                    problemObject['label'] = researchProblem;
                }

                contributionStatements[PREDICATES.HAS_RESEARCH_PROBLEM] = [problemObject];
            }

            for (const property in rowObject) {
                let propertyId;
                propertyId = valueToId[property] || undefined;

                // property has mapping
                if (!propertyId && hasMapping(property)) {
                    const id = cleanLabel(property);
                    try {
                        const fetchedPredicate = await getPredicate(id);
                        if (fetchedPredicate) {
                            propertyId = fetchedPredicate.id;
                            _idToLabel[propertyId] = fetchedPredicate.label;
                            valueToId[property] = propertyId;
                        }
                    } catch (e) {}
                }

                // no property id found
                if (!propertyId) {
                    // property label already exists, get the ID
                    const fetchedPredicate = await getAllPredicates({ q: property, exact: true });
                    if (fetchedPredicate.length) {
                        propertyId = fetchedPredicate[0].id;
                        _idToLabel[propertyId] = property;
                        valueToId[property] = propertyId;
                    } else {
                        // property does not exist, it will be created when saving the papers
                        propertyId = property;
                    }
                }

                for (let value of rowObject[property]) {
                    // don't add empty values and don't add if a property is not mapped
                    if (!value || !isString(property)) {
                        // || !property.startsWith('orkg:')
                        continue;
                    }

                    const isResource = hasMapping(value);
                    value = isResource ? cleanLabel(value) : value;

                    if (!(propertyId in contributionStatements)) {
                        contributionStatements[propertyId] = [];
                    }

                    let valueObject;

                    // if this is a resource (i.e. starting with 'orkg:'): get the label
                    if (isResource && !(value in _idToLabel)) {
                        const resource = await getResource(value);
                        if (resource) {
                            _idToLabel[value] = resource.label;

                            valueObject = {
                                '@id': value
                            };
                        }
                    }

                    // this will always create a new resource, not matter whether there already exists one
                    // (this is different from the CSV import from the Python script, where there is a lookup on the label)
                    if (!valueObject && isNewResource(value)) {
                        valueObject = {
                            label: cleanNewResource(value)
                        };
                    }

                    if (!valueObject) {
                        valueObject = {
                            text: value
                        };
                    }
                    contributionStatements[propertyId].push(valueObject);
                }
            }

            const paperId = await getExistingPaperId(title, doi);
            _existingPaperIds.push(paperId);

            const paper = {
                title,
                doi,
                authors,
                publicationMonth,
                publicationYear,
                researchField,
                url: '',
                publishedIn: null,
                contributions: [
                    {
                        name: 'Contribution',
                        values: contributionStatements
                    }
                ]
            };

            _papers.push(paper);
        }
        setIsLoading(false);
        setPapers(_papers);
        setExistingPaperIds(_existingPaperIds);
        setIdToLabel(_idToLabel);
    }, [data]);

    const getExistingPaperId = async (title, doi) => {
        // first check if there is a paper with this DOI
        if (doi) {
            try {
                const paper = await getPaperByDOI(doi);

                if (paper) {
                    return paper.id;
                }
            } catch (e) {}
        }

        // if no paper is found, check if there is a paper with this title
        const paperResources = await getResourcesByClass({
            id: CLASSES.PAPER,
            q: title,
            exact: true
        });

        return paperResources.length ? paperResources[0].id : null;
    };

    const cleanLabel = label => {
        return label.replace(/^(orkg:)/, '');
    };

    const hasMapping = value => {
        return isString(value) && value.startsWith('orkg:');
    };

    const isNewResource = value => {
        return isString(value) && value.startsWith('resource:');
    };

    const cleanNewResource = label => {
        return label.replace(/^(resource:)/, '');
    };

    const handleImport = async () => {
        if (createdContributions.length > 0) {
            toast.error('The papers are imported already');
            return;
        }

        setIsLoading(true);

        // make a local copy to ensure changes are directly applied (and don't require a rerender)
        const _idToLabel = { ...idToLabel };
        const newProperties = {};

        for (const paper of papers) {
            try {
                // create new properties for the ones that do not yet exist
                for (const property in paper.contributions[0].values) {
                    // property does not yet exist, create a new one
                    if (!(property in _idToLabel) && !(property in newProperties)) {
                        const newProperty = await createPredicate(property);
                        newProperties[property] = newProperty.id;
                    }
                    // assign the newly created property id to the contribution
                    if (property in newProperties) {
                        const newId = newProperties[property];
                        const propertyObject = paper.contributions[0].values;
                        // rename the property label to the property id
                        delete Object.assign(propertyObject, { [newId]: propertyObject[property] })[property];
                    }
                }

                // add the paper
                const _paper = await saveFullPaper({ paper }, true);

                // get paper statements so it is possible to list the contribution IDs and make a comparison
                const paperStatements = await getStatementsBySubject({ id: _paper.id });

                for (const statement of paperStatements) {
                    if (statement.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                        setCreatedContributions(state => [
                            ...state,
                            {
                                paperId: _paper.id,
                                contributionId: statement.object.id
                            }
                        ]);
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
                toast.error('Something went wrong while adding the paper: ' + paper.paper.title);
            }
        }
        setIsLoading(false);
        onFinish();
    };

    return { papers, existingPaperIds, idToLabel, isLoading, createdContributions, makePaperList, handleImport };
};

export default useImportBulkData;
