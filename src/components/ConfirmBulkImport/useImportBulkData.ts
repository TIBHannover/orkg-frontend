import { Cite } from '@citation-js/core';
import { isUri } from '@hyperjump/uri';
import { isString, omit, uniqueId } from 'lodash';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { DEFAULT_HEADERS } from '@/app/csv-import/steps/helpers';
import {
    cleanLabel,
    cleanLabelProperty,
    cleanNewResource,
    getExistingPaperId,
    getFirstValue,
    hasMapping,
    isNewResource,
    parseDataTypes,
    propertyHasMapping,
} from '@/components/ConfirmBulkImport/helpers';
import useMembership from '@/components/hooks/useMembership';
import { getConfigByType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { createPredicate, getPredicate, getPredicates } from '@/services/backend/predicates';
import { createResource, getResources } from '@/services/backend/resources';
import { getStatements } from '@/services/backend/statements';
import { getThing } from '@/services/backend/things';
import { ExtractionMethod } from '@/services/backend/types';
import { parseCiteResult } from '@/utils';

type ImportBulkDataProps = {
    data: string[][];
    onFinish: () => void;
};

const useImportBulkData = ({ data, onFinish }: ImportBulkDataProps) => {
    const [papers, setPapers] = useState<any[]>([]);
    const [existingPaperIds, setExistingPaperIds] = useState<(string | null)[]>([]);
    const [idToLabel, setIdToLabel] = useState({});
    const [idToEntityType, setIdToEntityType] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [importFailed, setImportFailed] = useState<string[]>([]);
    const [createdContributions, setCreatedContributions] = useState<{ paperId: string; contributionId: string }[]>([]);
    const { observatoryId, organizationId } = useMembership();

    const makePaperList = useCallback(async () => {
        const _papers: any[] = [];
        const _validationErrors: Record<number, Record<string, boolean[]>> = {};
        const header = data[0];
        const rows = data.slice(1);
        const _existingPaperIds: (string | null)[] = [];
        // used to map resource/property IDs to their labels
        const _idToLabel = {
            [PREDICATES.HAS_RESEARCH_PROBLEM]: 'has research problem',
        };
        const _idToEntityType = {
            [PREDICATES.HAS_RESEARCH_PROBLEM]: ENTITIES.PREDICATE,
        };
        // used to map property values to their IDs (not the inverse of _idToLabel!)
        const valueToId: Record<string, string> = {};

        setIsLoading(true);

        for (const [i, row] of rows.entries()) {
            // make use of an array for cells, in case multiple columns exist with the same label
            let rowObject: Record<string, string[]> = {};
            for (const [index, headerItem] of header.entries()) {
                if (!(headerItem in rowObject)) {
                    rowObject[headerItem] = [];
                }
                rowObject[headerItem].push(row[index]);
            }

            let title = getFirstValue(rowObject, 'title');
            const _authors = getFirstValue(rowObject, PREDICATES.HAS_AUTHORS, '');
            let authors = _authors.length ? _authors.split(';').map((name: string) => ({ name })) : [];
            let publicationMonth = getFirstValue(rowObject, PREDICATES.HAS_PUBLICATION_MONTH);
            let publicationYear = getFirstValue(rowObject, PREDICATES.HAS_PUBLICATION_YEAR);
            const doi = getFirstValue(rowObject, PREDICATES.HAS_DOI);
            let url = getFirstValue(rowObject, PREDICATES.URL);
            let researchField = getFirstValue(rowObject, PREDICATES.HAS_RESEARCH_FIELD, RESOURCES.RESEARCH_FIELD_MAIN);
            let publishedIn = getFirstValue(rowObject, PREDICATES.HAS_VENUE);
            const extractionMethod = getFirstValue(rowObject, 'extraction_method', EXTRACTION_METHODS.UNKNOWN).toUpperCase();
            let paperMetadata = null;
            if (doi) {
                try {
                    // eslint-disable-next-line no-await-in-loop
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
                    // validate becuase it has to be RFC 3987 compliant and not just a URL, the RDF spec says that URLs should be RFC 3987 compliant, otherwise it will be rejected by the backend
                    url = url || (isUri(paperMetadata.url) ? paperMetadata.url : '');
                }
            }

            rowObject = omit(
                rowObject,
                DEFAULT_HEADERS.map((h) => h.id).filter((id) => id !== PREDICATES.HAS_RESEARCH_PROBLEM),
            );

            const contributionStatements: Record<string, any[]> = {};

            // replace :orkg prefix in research field
            if (isString(researchField) && researchField.startsWith('orkg:')) {
                researchField = cleanLabel(researchField);
            }

            for (const property in rowObject) {
                if (!Object.prototype.hasOwnProperty.call(rowObject, property)) continue;
                let propertyId;
                if (property !== PREDICATES.HAS_RESEARCH_PROBLEM) {
                    propertyId = valueToId[property] || undefined;
                } else {
                    propertyId = PREDICATES.HAS_RESEARCH_PROBLEM;
                }

                // property has mapping
                if (!propertyId && propertyHasMapping(property)) {
                    const id = cleanLabelProperty(property);
                    try {
                        // eslint-disable-next-line no-await-in-loop
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
                    const cleanedProperty = cleanLabelProperty(property);
                    // eslint-disable-next-line no-await-in-loop
                    const fetchedPredicate = await getPredicates({ q: cleanedProperty, exact: true });
                    if (fetchedPredicate.page.total_elements) {
                        propertyId = fetchedPredicate.content[0].id;
                        _idToLabel[propertyId] = cleanedProperty;
                        valueToId[property] = propertyId;
                    } else {
                        // property does not exist, it will be created when saving the papers
                        propertyId = cleanedProperty;
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
                                // eslint-disable-next-line no-await-in-loop
                                const resource = await getThing(value);
                                if (resource) {
                                    _idToLabel[value] = resource.label;
                                    _idToEntityType[value] = resource._class;
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
                            // eslint-disable-next-line no-await-in-loop
                            fetchedResource = await getResources({ q: cleanNewResource(value), exact: true });
                        }
                        if (propertyId === PREDICATES.HAS_RESEARCH_PROBLEM) {
                            // eslint-disable-next-line no-await-in-loop
                            fetchedResource = await getResources({ include: [CLASSES.PROBLEM], q: cleanNewResource(value), exact: true });
                        }
                        if (fetchedResource?.page?.total_elements) {
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
                        const { error: _error, data: parsedValue } = getConfigByType(datatype).schema?.safeParse(text) || { error: true, data: text };
                        error = !!_error;
                        valueObject = {
                            text: parsedValue.toString(),
                            datatype,
                        };
                    }
                    contributionStatements[propertyId].push(valueObject);
                    if (!(i in _validationErrors)) {
                        _validationErrors[i] = {};
                    }
                    if (!(propertyId in _validationErrors[i])) {
                        _validationErrors[i][propertyId] = [];
                    }
                    _validationErrors[i][propertyId].push(error);
                }
            }

            // eslint-disable-next-line no-await-in-loop
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
                extraction_method: extractionMethod as ExtractionMethod,
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
        setIdToEntityType(_idToEntityType);
        setValidationErrors(_validationErrors);
    }, [data, observatoryId, organizationId]);

    const handleImport = async () => {
        if (createdContributions.length > 0) {
            toast.error('The papers are imported already');
            return;
        }

        setIsLoading(true);

        // make a local copy to ensure changes are directly applied (and don't require a rerender)
        const _idToLabel = { ...idToLabel };
        const newProperties: Record<string, string> = {};
        const newResources: Record<string, string> = {};
        const newLiterals: Record<string, { label: string; data_type: string }> = {};

        for (const paper of papers.filter((_paper) => Object.keys(_paper.contents[0].statements).length > 0)) {
            try {
                // create new properties for the ones that do not yet exist
                for (let property in paper.contents[0].statements) {
                    if (!Object.prototype.hasOwnProperty.call(paper.contents[0].statements, property)) continue;
                    // property does not yet exist, create a new one
                    if (!(property in _idToLabel) && !(property in newProperties)) {
                        const newPropertyId = await createPredicate(property);
                        newProperties[property] = newPropertyId;
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
                                const newResourceId = await createResource({ label, classes: [] });
                                newResources[label] = newResourceId;
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
                let _paperId;
                try {
                    // eslint-disable-next-line no-await-in-loop
                    _paperId = await createPaperMergeIfExists({
                        paper,
                        contribution,
                        createContributionData: {
                            literals: newLiterals,
                        },
                        extractionMethod,
                    });
                } catch (e) {
                    _paperId = null;
                    setImportFailed((prev) => [...prev, paper.title]);
                }
                if (_paperId) {
                    // get paper statements so it is possible to list the contribution IDs and make a comparison
                    // eslint-disable-next-line no-await-in-loop
                    const paperStatements = await getStatements({ subjectId: _paperId });

                    for (const statement of paperStatements) {
                        if (statement.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                            setCreatedContributions((state) => [
                                ...state,
                                {
                                    paperId: _paperId,
                                    contributionId: statement.object.id,
                                },
                            ]);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                setImportFailed((prev) => [...prev, paper.title]);
            }
        }
        setIsLoading(false);
        onFinish();
    };

    return {
        papers,
        existingPaperIds,
        idToLabel,
        idToEntityType,
        isLoading,
        createdContributions,
        makePaperList,
        handleImport,
        validationErrors,
        importFailed,
    };
};

export default useImportBulkData;
