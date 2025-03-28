/* eslint-disable guard-for-in */
import { Cite } from '@citation-js/core';
import { isString, omit, uniqueId } from 'lodash';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import useMembership from '@/components/hooks/useMembership';
import DATA_TYPES, { checkDataTypeIsInValid, getSuggestionByValue } from '@/constants/DataTypes';
import { CLASSES, MISC, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { getPaperByDoi } from '@/services/backend/papers';
import { createPredicate, getPredicate, getPredicates } from '@/services/backend/predicates';
import { createResource, getResource, getResources } from '@/services/backend/resources';
import { getStatementsBySubject } from '@/services/backend/statements';
import { parseCiteResult } from '@/utils';

const PREDEFINED_COLUMNS = [
    'paper:title',
    'paper:authors',
    'paper:publication_month',
    'paper:publication_year',
    'paper:doi',
    'paper:url',
    'paper:research_field',
    'paper:published_in',
    'contribution:extraction_method',
];

const useImportBulkData = ({ data, onFinish }) => {
    const [papers, setPapers] = useState([]);
    const [existingPaperIds, setExistingPaperIds] = useState([]);
    const [idToLabel, setIdToLabel] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [createdContributions, setCreatedContributions] = useState([]);
    const { observatoryId, organizationId } = useMembership();

    const getFirstValue = (object, key, defaultValue = '') => (key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue);

    const findDataType = (literal) => DATA_TYPES.find((type) => literal.endsWith(`<${type.name.toLowerCase()}>`));

    const removeDataTypeLiteral = ({ literal, datatype }) => literal.replace(new RegExp(`<${datatype.name.toLowerCase()}>$`), '');

    const removeDataTypeHeader = useCallback((label) => {
        const datatype = findDataType(label);
        return datatype ? removeDataTypeLiteral({ literal: label, datatype }) : label;
    }, []);

    const parseDataTypes = useCallback(({ value: literal, property }) => {
        const datatype = findDataType(literal) || findDataType(property) || getSuggestionByValue(literal)?.[0];

        return {
            text: datatype ? removeDataTypeLiteral({ literal, datatype }) : literal,
            datatype: datatype ? datatype.type : MISC.DEFAULT_LITERAL_DATATYPE,
        };
    }, []);

    const cleanLabelProperty = useCallback(
        (label) =>
            removeDataTypeHeader(label)
                .replace(/^(resource:)/, '')
                .replace(/^(orkg:)/, ''),
        [removeDataTypeHeader],
    );

    const makePaperList = useCallback(async () => {
        const _papers = [];
        const _validationErrors = {};
        const header = data[0];
        const rows = data.slice(1);
        const _existingPaperIds = [];
        // used to map resource/property IDs to their labels
        const _idToLabel = {
            [PREDICATES.HAS_RESEARCH_PROBLEM]: 'has research problem',
        };
        // used to map property values to their IDs (not the inverse of _idToLabel!)
        const valueToId = {};

        setIsLoading(true);

        for (const [i, row] of rows.entries()) {
            // make use of an array for cells, in case multiple columns exist with the same label
            let rowObject = {};
            for (const [index, headerItem] of header.entries()) {
                if (!(headerItem in rowObject)) {
                    rowObject[headerItem] = [];
                }
                rowObject[headerItem].push(row[index]);
            }

            let title = getFirstValue(rowObject, 'paper:title');
            let authors = getFirstValue(rowObject, 'paper:authors', []);
            authors = authors.length ? authors.split(';').map((name) => ({ name })) : [];
            let publicationMonth = getFirstValue(rowObject, 'paper:publication_month');
            let publicationYear = getFirstValue(rowObject, 'paper:publication_year');
            const doi = getFirstValue(rowObject, 'paper:doi');
            const url = getFirstValue(rowObject, 'paper:url');
            let researchField = getFirstValue(rowObject, 'paper:research_field', RESOURCES.RESEARCH_FIELD_MAIN);
            let publishedIn = getFirstValue(rowObject, 'paper:published_in');
            const extractionMethod = getFirstValue(rowObject, 'contribution:extraction_method', EXTRACTION_METHODS.UNKNOWN).toUpperCase();
            let paperMetadata = null;
            if (doi) {
                try {
                    paperMetadata = await Cite.async(doi);
                } catch (error) {
                    paperMetadata = null;
                }

                if (paperMetadata) {
                    paperMetadata = parseCiteResult(paperMetadata);
                    title = paperMetadata.paperTitle;
                    authors = paperMetadata.paperAuthors;
                    publicationMonth = paperMetadata.paperPublicationMonth;
                    publicationYear = paperMetadata.paperPublicationYear;
                    publishedIn = paperMetadata.publishedIn;
                }
            }

            rowObject = omit(rowObject, PREDEFINED_COLUMNS);

            const contributionStatements = {};

            // replace :orkg prefix in research field
            if (isString(researchField) && researchField.startsWith('orkg:')) {
                researchField = cleanLabel(researchField);
            }

            for (const property in rowObject) {
                let propertyId;
                if (property !== 'contribution:research_problem') {
                    propertyId = valueToId[property] || undefined;
                } else {
                    propertyId = PREDICATES.HAS_RESEARCH_PROBLEM;
                }

                // property has mapping
                if (!propertyId && propertyHasMapping(property)) {
                    const id = cleanLabelProperty(property);
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
                    const fetchedPredicate = await getPredicates({ q: cleanLabelProperty(property), exact: true });
                    if (fetchedPredicate.totalElements) {
                        propertyId = fetchedPredicate.content[0].id;
                        _idToLabel[propertyId] = cleanLabelProperty(property);
                        valueToId[property] = propertyId;
                    } else {
                        // property does not exist, it will be created when saving the papers
                        propertyId = cleanLabelProperty(property);
                        valueToId[property] = propertyId;
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

                    // if this is a resource (i.e. starting with 'orkg:')
                    if (isResource) {
                        // get the label if it isn't yet fetched
                        if (!(value in _idToLabel)) {
                            try {
                                const resource = await getResource(value);
                                if (resource) {
                                    _idToLabel[value] = resource.label;
                                }
                            } catch (e) {}
                        }
                        if (value in _idToLabel) {
                            valueObject = {
                                id: value,
                            };
                        }
                    }

                    // This will look up for a resource with the same label a new resource,
                    // It will creates a new resource if no existence
                    // (during saving all resources that shares the same label will get the same resource ID)
                    if (
                        !valueObject &&
                        (property.startsWith('resource:') || isNewResource(value) || propertyId === PREDICATES.HAS_RESEARCH_PROBLEM)
                    ) {
                        const classes = propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? [CLASSES.PROBLEM] : undefined;

                        let fetchedResource;
                        if (property.startsWith('resource:')) {
                            fetchedResource = await getResources({ q: cleanNewResource(value), exact: true });
                        }
                        if (propertyId === PREDICATES.HAS_RESEARCH_PROBLEM) {
                            fetchedResource = await getResources({ include: [CLASSES.PROBLEM], q: cleanNewResource(value), exact: true });
                        }
                        if (fetchedResource?.totalElements) {
                            valueToId[cleanNewResource(value)] = fetchedResource.content[0].id;
                            _idToLabel[fetchedResource.content[0].id] = cleanNewResource(value);
                            valueObject = {
                                id: valueToId[cleanNewResource(value)],
                            };
                        } else {
                            valueObject = {
                                label: cleanNewResource(value),
                                class: classes,
                            };
                        }
                    }
                    let error = false;
                    if (!valueObject) {
                        const { text, datatype } = parseDataTypes({ value, property });
                        valueObject = {
                            text,
                            datatype,
                        };
                        error = checkDataTypeIsInValid({ dataType: datatype, value: text });
                    }
                    contributionStatements[propertyId].push(valueObject);
                    if (!(i in _validationErrors)) {
                        _validationErrors[i] = [];
                    }
                    if (!(propertyId in _validationErrors[i])) {
                        _validationErrors[i][propertyId] = [];
                    }
                    _validationErrors[i][propertyId].push(error);
                }
            }

            const paperId = await getExistingPaperId(title, doi);
            _existingPaperIds.push(paperId);

            const paper = {
                title,
                research_fields: [researchField],
                ...(doi
                    ? {
                          identifiers: {
                              doi: [doi],
                          },
                      }
                    : {}),
                publication_info: {
                    published_month: publicationMonth,
                    published_year: publicationYear,
                    published_in: publishedIn || null,
                    url,
                },
                authors,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                extraction_method: extractionMethod,
                contents: [
                    {
                        label: 'Contribution',
                        statements: contributionStatements,
                    },
                ],
            };

            _papers.push(paper);
        }
        setIsLoading(false);
        setPapers(_papers);
        setExistingPaperIds(_existingPaperIds);
        setIdToLabel(_idToLabel);
        setValidationErrors(_validationErrors);
    }, [cleanLabelProperty, data, parseDataTypes]);

    const getExistingPaperId = async (title, doi) => {
        // first check if there is a paper with this DOI
        if (doi) {
            try {
                const paper = await getPaperByDoi(doi);

                if (paper) {
                    return paper.id;
                }
            } catch (e) {}
        }

        // if no paper is found, check if there is a paper with this title
        const paperResources = await getResources({
            include: [CLASSES.PAPER],
            q: title,
            exact: true,
            returnContent: true,
        });

        return paperResources.length ? paperResources[0].id : null;
    };

    const cleanLabel = (label) => label.replace(/^(orkg:)/, '');

    const propertyHasMapping = (value) => isString(value) && (value.startsWith('orkg:') || value.replace(/^(resource:)/, '').startsWith('orkg:'));

    const hasMapping = (value) => isString(value) && value.startsWith('orkg:');

    const isNewResource = (value) => isString(value) && value.startsWith('resource:');

    const cleanNewResource = (label) => label.replace(/^(resource:)/, '');

    const handleImport = async () => {
        if (createdContributions.length > 0) {
            toast.error('The papers are imported already');
            return;
        }

        setIsLoading(true);

        // make a local copy to ensure changes are directly applied (and don't require a rerender)
        const _idToLabel = { ...idToLabel };
        const newProperties = {};
        const newResources = {};
        const newLiterals = {};

        for (const paper of papers.filter((_paper) => Object.keys(_paper.contents[0].statements).length > 0)) {
            try {
                // create new properties for the ones that do not yet exist
                for (let property in paper.contents[0].statements) {
                    // property does not yet exist, create a new one
                    if (!(property in _idToLabel) && !(property in newProperties)) {
                        const newProperty = await createPredicate(property);
                        newProperties[property] = newProperty.id;
                    }
                    // assign the newly created property id to the contribution
                    if (property in newProperties) {
                        const newId = newProperties[property];
                        const propertyObject = paper.contents[0].statements;
                        // rename the property label to the property id
                        delete Object.assign(propertyObject, { [newId]: propertyObject[property] })[property];
                        property = newId;
                    }
                    // if new resources should be created, create them now
                    // then ensure that duplicate resource labels are mapped to the same newly created resource  ID
                    // (don't loop over 'statements' directly, because they might be updated while creating properties above)
                    for (const [index, value] of paper.contents[0].statements[property].entries()) {
                        // if there is a label, a new resource is created
                        if ('label' in value) {
                            const { label } = value;
                            if (!(label in newResources)) {
                                const newResource = await createResource(label);
                                newResources[label] = newResource.id;
                            }
                            if (label in newResources) {
                                const newId = newResources[label];
                                paper.contents[0].statements[property][index] = {
                                    id: newId,
                                };
                            }
                        }
                        if ('text' in value) {
                            const literalId = uniqueId('#');
                            newLiterals[literalId] = {
                                label: value.text,
                                data_type: value.datatype,
                            };
                            paper.contents[0].statements[property][index] = {
                                id: literalId,
                            };
                        }
                    }
                }
                const contribution = paper.contents[0];
                delete paper.contents[0];
                const extractionMethod = paper.extraction_method;
                delete paper.extraction_method;

                // only create the paper if there is contribution data (backend endpoint requirement)
                const _paper = await createPaperMergeIfExists({
                    paper,
                    contribution,
                    createContributionData: {
                        literals: newLiterals,
                    },
                    extractionMethod,
                });

                // get paper statements so it is possible to list the contribution IDs and make a comparison
                const paperStatements = await getStatementsBySubject({ id: _paper });

                for (const statement of paperStatements) {
                    if (statement.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                        setCreatedContributions((state) => [
                            ...state,
                            {
                                paperId: _paper,
                                contributionId: statement.object.id,
                            },
                        ]);
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
                toast.error(`Something went wrong while adding the paper: ${paper.title}`);
            }
        }
        setIsLoading(false);
        onFinish();
    };

    return { papers, existingPaperIds, idToLabel, isLoading, createdContributions, makePaperList, handleImport, validationErrors };
};

export default useImportBulkData;
