import { sortBy } from 'lodash';
import { DataFactory, Parser, Store } from 'n3';
import format from 'string-format';

import useMembership from '@/components/hooks/useMembership';
import { extractConcept, extractLabelFromRdfURI, mapClass, mapPredicate, mapResource } from '@/components/Templates/ImportSHACL/helpers/helpers';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { createClass, getClassById, getClasses } from '@/services/backend/classes';
import { createPredicate, getPredicate } from '@/services/backend/predicates';
import { createTemplate, getTemplate, getTemplates } from '@/services/backend/templates';
import { Class, CreateTemplateParams, Node, PaginatedResponse, Resource } from '@/services/backend/types';

const { namedNode } = DataFactory;

// Type for the mapped predicate result
type MappedPredicate = ((Node | { label: string; uri: string | null }) & { extractedId: string }) | null;

// Type for the mapped class/range result
type MappedClass = ((Node | { label: string; uri: string | null }) & { extractedId: string }) | null;

// Create a parsed version of PropertyShape that matches the actual object structure being created
type ParsedPropertyShape = {
    path?: MappedPredicate;
    minCount?: string;
    maxCount?: string;
    min_inclusive?: string;
    max_inclusive?: string;
    order?: string;
    pattern?: string;
    range?: MappedClass;
    placeholder?: string;
    description?: string;
};

export type ParsedTemplate = {
    label: string;
    description: string;
    formatted_label: string;
    target_class: MappedClass & { uri?: string | null };
    relations: {
        research_fields: (Resource | { label: string; classes: string[] })[] | null;
        research_problems: (Resource | { label: string; classes: string[] })[] | null;
        predicate?: MappedPredicate;
    };
    properties: ParsedPropertyShape[];
    is_closed: boolean;
    targetClassHasAlreadyTemplate?: boolean;
    existingTemplateId?: string | null;
};

const useImportSHACL = () => {
    const { observatoryId, organizationId } = useMembership();

    const parseTemplates = async (text: string) => {
        const result: ParsedTemplate[] = [];

        const shacl = (suffix: string) => namedNode(`http://www.w3.org/ns/shacl#${suffix}`);
        const orkgp = (suffix: string) => namedNode(`http://orkg.org/orkg/predicate/${suffix}`);
        const rdf = (suffix: string) => namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${suffix}`);
        const rdfs = (suffix: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${suffix}`);

        const parser = new Parser();
        const store = new Store();
        const quads = parser.parse(text);
        store.addQuads(quads);

        const nodesShapesNodes = extractConcept(store, 'subject', null, rdf('type'), shacl('NodeShape'), false);
        // NodeShapes
        const nodesShapes = nodesShapesNodes?.map(async (nodesShape) => {
            let targetClassHasAlreadyTemplate = false;
            let existingTemplateId = null;
            // template label
            const templateLabel = extractConcept(store, 'object', nodesShape, rdfs('label'), null, true);
            // Target Class
            const targetClass = await mapClass(store, extractConcept(store, 'object', nodesShape, shacl('targetClass'), null, true));
            if (!targetClass) {
                throw new Error('Template target class is required');
            }
            if (targetClass && 'id' in targetClass && targetClass.id) {
                const classId = targetClass.id;
                //  Check if the template of the class if already defined
                const templates = await getTemplates({ targetClass: classId });
                if (templates.content.length > 0) {
                    existingTemplateId = templates.content[0].id;
                    targetClassHasAlreadyTemplate = true;
                }
            }
            // Description
            const description = extractConcept(store, 'object', nodesShape, orkgp(PREDICATES.DESCRIPTION), null, true);
            // Formatted label
            const formattedLabel = extractConcept(store, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_LABEL_FORMAT), null, true);
            // ResearchField
            const researchFields = extractConcept(store, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_FIELD), null, false);
            let researchFieldsObj: (Resource | { label: string; classes: string[] })[] = [];
            if (researchFields && researchFields.length > 0) {
                researchFieldsObj = (
                    await Promise.all(researchFields.map((researchField) => mapResource(store, researchField, [CLASSES.RESEARCH_FIELD])))
                ).filter((researchField) => researchField !== null);
            } else {
                researchFieldsObj = [];
            }
            // ResearchProblem
            const researchProblems = extractConcept(store, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), null, false);
            let researchProblemsObj: (Resource | { label: string; classes: string[] })[] = [];
            if (researchProblems && researchProblems.length > 0) {
                researchProblemsObj = (
                    await Promise.all(researchProblems.map((researchProblem) => mapResource(store, researchProblem, [CLASSES.PROBLEM])))
                ).filter((researchProblem) => researchProblem !== null);
            } else {
                researchProblemsObj = [];
            }
            const closed = extractConcept(store, 'object', nodesShape, shacl('closed'), null, true);
            // PropertyShapes
            const propertyShapes = extractConcept(store, 'object', nodesShape, shacl('property'), null, false);
            let propertyShapesObj: ParsedPropertyShape[] = [];
            if (!propertyShapes) {
                propertyShapesObj = [];
            }

            const propertyShapesPromises =
                propertyShapes?.map(async (propertyShape) => {
                    const predicate = await mapPredicate(store, extractConcept(store, 'object', propertyShape, shacl('path'), null, true));
                    let mappedRange = null;
                    const minCount = extractConcept(store, 'object', propertyShape, shacl('minCount'), null, true);
                    const maxCount = extractConcept(store, 'object', propertyShape, shacl('maxCount'), null, true);
                    const minInclusive = extractConcept(store, 'object', propertyShape, shacl('minInclusive'), null, true);
                    const maxInclusive = extractConcept(store, 'object', propertyShape, shacl('maxInclusive'), null, true);
                    const order = extractConcept(store, 'object', propertyShape, shacl('order'), null, true);
                    const pattern = extractConcept(store, 'object', propertyShape, shacl('pattern'), null, true);
                    const datatype = extractConcept(store, 'object', propertyShape, shacl('datatype'), null, true);
                    const classNode = extractConcept(store, 'object', propertyShape, shacl('class'), null, true);
                    const placeholder = extractConcept(store, 'object', propertyShape, orkgp(PREDICATES.PLACEHOLDER), null, true);
                    const shapeDescription = extractConcept(store, 'object', propertyShape, shacl('description'), null, true);
                    if (classNode) {
                        mappedRange = await mapClass(store, classNode);
                    } else {
                        mappedRange = await mapClass(store, datatype);
                    }
                    return {
                        path: predicate || undefined,
                        minCount: minCount?.value || minCount?.toString() || undefined,
                        maxCount: maxCount?.value || maxCount?.toString() || undefined,
                        min_inclusive: minInclusive?.value || minInclusive?.toString() || undefined,
                        max_inclusive: maxInclusive?.value || maxInclusive?.toString() || undefined,
                        order: order?.value || order?.toString() || undefined,
                        pattern: pattern?.value || pattern?.toString() || undefined,
                        range: mappedRange || undefined,
                        placeholder: placeholder?.value || placeholder?.toString() || undefined,
                        description: shapeDescription?.value || shapeDescription?.toString() || undefined,
                    };
                }) ?? [];
            propertyShapesObj = await Promise.all(propertyShapesPromises);
            propertyShapesObj = sortBy(propertyShapesObj ?? [], 'order');
            result.push({
                label: templateLabel?.value || templateLabel?.toString() || (extractLabelFromRdfURI(nodesShape.value) as string),
                description: description?.value || description?.toString() || '',
                formatted_label: formattedLabel?.value || formattedLabel?.toString() || '',
                relations: {
                    research_fields: researchFieldsObj,
                    research_problems: researchProblemsObj,
                },
                properties: propertyShapesObj,
                is_closed: closed?.value === 'true' || closed?.toString() === 'true' || false,
                target_class: targetClass,
                targetClassHasAlreadyTemplate,
                existingTemplateId,
            });
            return null;
        });
        await Promise.all(nodesShapes || []);
        return result;
    };

    const createMappingClasses = async (data: ParsedTemplate[]) => {
        const classMap = new Map<string, MappedClass>();
        const uniqueClasses = new Set<string>();

        // Collect all unique classes from target classes and ranges
        data.forEach((template) => {
            // Add target class
            if (template.target_class?.extractedId) {
                uniqueClasses.add(template.target_class.extractedId);
            }

            // Add range classes from properties
            template.properties?.forEach((property) => {
                if (property.range?.extractedId) {
                    uniqueClasses.add(property.range.extractedId);
                }
            });
        });

        // Process each unique class
        const classPromises = Array.from(uniqueClasses).map(async (extractedId) => {
            // Find the original class object from the data
            let originalClass: MappedClass = null;
            // Search in target classes
            for (const template of data) {
                if (template.target_class?.extractedId === extractedId) {
                    originalClass = template.target_class;
                    break;
                }
                // Search in property ranges
                for (const property of template.properties || []) {
                    if (property.range?.extractedId === extractedId) {
                        originalClass = property.range;
                        break;
                    }
                }
                if (originalClass) break;
            }

            if (!originalClass) return;

            let mappedClass: MappedClass = originalClass;

            // If class doesn't have an ID, create or fetch it
            if (!('id' in originalClass) && originalClass.label) {
                try {
                    // Check if class exists by URI first
                    if (originalClass.uri) {
                        try {
                            const r = await getClasses({ uri: originalClass.uri });
                            let fetchedClass: Class | null = null;
                            if (r && !('page' in r) && !('content' in r)) {
                                fetchedClass = r;
                            } else if (!('page' in r) && !('content' in r)) {
                                fetchedClass = null;
                            } else if ((r as unknown as PaginatedResponse<Class>).content.length > 0) {
                                [fetchedClass] = (r as unknown as PaginatedResponse<Class>).content;
                            } else {
                                fetchedClass = null;
                            }
                            if (fetchedClass) {
                                mappedClass = { ...fetchedClass, extractedId: originalClass.extractedId };
                            }
                        } catch {
                            // Class doesn't exist by URI, will create new one
                        }
                    }

                    // If still no ID, create the class
                    if (!('id' in mappedClass)) {
                        const newClassId = await createClass(originalClass.label, originalClass.uri);
                        const createdClass = await getClassById(newClassId);
                        mappedClass = { ...createdClass, extractedId: originalClass.extractedId };
                    }
                } catch (error) {
                    console.error(`Error processing class ${originalClass?.label || originalClass?.extractedId}:`, error);
                    mappedClass = originalClass; // Keep original if creation fails
                }
            }

            classMap.set(extractedId, mappedClass);
        });

        await Promise.all(classPromises);
        return classMap;
    };

    const importTemplates = async (data: ParsedTemplate[]) => {
        const _result: string[] = [];

        // Create mappingClasses for all templates to ensure consistent IDs
        const mappingClasses = await createMappingClasses(data);
        const saveNodeShapesCalls = data
            .filter((nShape) => !nShape.targetClassHasAlreadyTemplate)
            .map(async (nodesShape) => {
                // Use pre-mapped target class
                let targetClass = nodesShape.target_class;
                if (targetClass?.extractedId && mappingClasses.has(targetClass.extractedId)) {
                    targetClass = mappingClasses.get(targetClass.extractedId) || targetClass;
                }
                const mappingPredicates = await Promise.all(
                    (nodesShape.properties || []).map(async (propertyShape) => {
                        if (propertyShape.path && !('id' in propertyShape.path) && propertyShape.path.label) {
                            const newPid = await createPredicate(propertyShape.path?.label);
                            return getPredicate(newPid).then((r) => ({ ...propertyShape.path, ...r } as MappedPredicate));
                        }
                        return propertyShape.path;
                    }),
                );
                const mappingRanges = (nodesShape.properties || []).map((propertyShape) => {
                    // Use pre-mapped range class
                    if (propertyShape.range?.extractedId && mappingClasses.has(propertyShape.range.extractedId)) {
                        return mappingClasses.get(propertyShape.range.extractedId) || propertyShape.range;
                    }
                    return propertyShape.range;
                });
                const hasId = (node: Node | { label: string; classes: string[] }): node is Node => node && 'id' in node && !!node.id;
                // Prepare the object for the import
                const templateObject: CreateTemplateParams = {
                    label: nodesShape.label,
                    target_class: (targetClass && 'id' in targetClass ? targetClass.id : '') || '',
                    ...(nodesShape.formatted_label && {
                        formatted_label: format(
                            nodesShape.formatted_label,
                            Object.assign({}, ...mappingPredicates.map((p) => p && 'id' in p && p.id && { [p.extractedId]: `{${p.id}}` })),
                        ),
                    }),
                    relations: {
                        ...((nodesShape.relations.research_fields || [])?.length > 0
                            ? {
                                  research_fields: (nodesShape.relations.research_fields || [])
                                      .filter((researchField) => hasId(researchField))
                                      .map((researchField) => researchField.id),
                              }
                            : { research_fields: [] }),
                        ...((nodesShape.relations.research_problems || [])?.length > 0
                            ? {
                                  research_problems: (nodesShape.relations.research_problems || [])
                                      .filter((researchProblem) => hasId(researchProblem))
                                      .map((researchProblem) => researchProblem.id),
                              }
                            : { research_problems: [] }),
                    },
                    properties: (nodesShape.properties || [])
                        .map((propertyShape, index) => {
                            // Only include properties that have valid predicates
                            if (!mappingPredicates[index] || !('id' in mappingPredicates[index]) || !mappingPredicates[index].id) {
                                return null;
                            }

                            return {
                                label: 'Property shape',
                                placeholder: propertyShape.placeholder || '',
                                description: propertyShape.description || '',
                                path: mappingPredicates[index].id,
                                ...(propertyShape.minCount && {
                                    min_count: propertyShape.minCount,
                                }),
                                ...(propertyShape.maxCount && {
                                    max_count: propertyShape.maxCount,
                                }),
                                ...(mappingRanges[index] &&
                                    'id' in mappingRanges[index] &&
                                    mappingRanges[index].id &&
                                    [CLASSES.DECIMAL, CLASSES.INTEGER, CLASSES.STRING, CLASSES.BOOLEAN, CLASSES.DATE, CLASSES.URI].includes(
                                        mappingRanges[index].id,
                                    ) && {
                                        datatype: mappingRanges[index].id,
                                    }),
                                ...(mappingRanges[index] &&
                                    'id' in mappingRanges[index] &&
                                    mappingRanges[index].id &&
                                    ![CLASSES.DECIMAL, CLASSES.INTEGER, CLASSES.STRING, CLASSES.BOOLEAN, CLASSES.DATE, CLASSES.URI].includes(
                                        mappingRanges[index].id,
                                    ) && {
                                        class: mappingRanges[index].id,
                                    }),
                                ...(mappingRanges[index] &&
                                    'id' in mappingRanges[index] &&
                                    mappingRanges[index].id &&
                                    [CLASSES.DECIMAL, CLASSES.INTEGER].includes(mappingRanges[index].id) && {
                                        min_inclusive: propertyShape.min_inclusive,
                                        max_inclusive: propertyShape.max_inclusive,
                                    }),
                                ...(mappingRanges[index] &&
                                    'id' in mappingRanges[index] &&
                                    mappingRanges[index].id &&
                                    ![CLASSES.STRING].includes(mappingRanges[index].id) && {
                                        pattern: propertyShape.pattern,
                                    }),
                            };
                        })
                        .filter((property) => property !== null),
                    observatories: observatoryId ? [observatoryId] : [],
                    organizations: organizationId ? [organizationId] : [],
                };

                const templateResource = await createTemplate(templateObject);
                _result.push(templateResource);
                return templateResource;
            });
        await Promise.all(saveNodeShapesCalls);
        const newTemplates = await Promise.all(_result.map((t) => getTemplate(t)));
        return newTemplates;
    };
    return { parseTemplates, importTemplates };
};

export default useImportSHACL;
