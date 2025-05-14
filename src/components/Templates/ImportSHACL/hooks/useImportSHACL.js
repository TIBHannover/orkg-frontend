import { sortBy } from 'lodash';
import rdf from 'rdf';
import format from 'string-format';

import useMembership from '@/components/hooks/useMembership';
import { extractConcept, extractLabelFromRdfURI, mapClass, mapPredicate, mapResource } from '@/components/Templates/ImportSHACL/helpers/helpers';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { createClass, getClassById, getClasses } from '@/services/backend/classes';
import { createPredicate, getPredicate } from '@/services/backend/predicates';
import { getTemplatesByClass } from '@/services/backend/statements';
import { createTemplate, getTemplate } from '@/services/backend/templates';

const useImportSHACL = () => {
    const { observatoryId, organizationId } = useMembership();

    const parseTemplates = async (text) => {
        const result = [];
        // initialize
        const shacl = rdf.ns('http://www.w3.org/ns/shacl#');
        const orkgp = rdf.ns('http://orkg.org/orkg/predicate/');
        const parsed = rdf.TurtleParser.parse(text);
        const nodesShapesNodes = extractConcept(parsed.graph, 'subject', null, rdf.rdfns('type'), shacl('NodeShape'), false);
        // NodeShapes
        const nodesShapes = nodesShapesNodes.map(async (nodesShape) => {
            let targetClassHasAlreadyTemplate = false;
            let existingTemplateId = null;
            // template label
            const templateLabel = extractConcept(parsed.graph, 'object', nodesShape, rdf.rdfsns('label'), null, true);
            // Target Class
            const targetClass = await mapClass(
                parsed.graph,
                extractConcept(parsed.graph, 'object', nodesShape, shacl('targetClass'), null, true),
                null,
                true,
            );
            if (!targetClass) {
                throw new Error('Template target class is required');
            }
            if (targetClass?.id) {
                const classId = targetClass.id;
                //  Check if the template of the class if already defined
                const templates = await getTemplatesByClass(classId);
                if (templates.length > 0) {
                    [existingTemplateId] = templates;
                    targetClassHasAlreadyTemplate = true;
                }
            }
            // Description
            const description = extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.DESCRIPTION), null, true);
            // Formatted label
            const formattedLabel = extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_LABEL_FORMAT), null, true);
            // Template Predicate
            const templatePredicate = await mapPredicate(
                extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_PREDICATE), null, true),
            );
            // ResearchField
            let researchFields = extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_FIELD), null, false);
            if (researchFields?.length > 0) {
                researchFields = await Promise.all(
                    researchFields.map(async (researchField) => mapResource(parsed.graph, researchField, [CLASSES.RESEARCH_FIELD])),
                );
            }
            // ResearchProblem
            let researchProblems = extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), null, false);
            if (researchProblems?.length > 0) {
                researchProblems = await Promise.all(
                    researchProblems.map(async (researchProblem) => mapResource(parsed.graph, researchProblem, [CLASSES.PROBLEM])),
                );
            }
            const closed = extractConcept(parsed.graph, 'object', nodesShape, shacl('closed'), null, true);
            // PropertyShapes
            let propertyShapes = extractConcept(parsed.graph, 'object', nodesShape, shacl('property'), null, false);

            propertyShapes = propertyShapes.map(async (propertyShape) => {
                const predicate = await mapPredicate(parsed.graph, extractConcept(parsed.graph, 'object', propertyShape, shacl('path'), null, true));
                let mappedRange = null;
                const minCount = extractConcept(parsed.graph, 'object', propertyShape, shacl('minCount'), null, true);
                const maxCount = extractConcept(parsed.graph, 'object', propertyShape, shacl('maxCount'), null, true);
                const minInclusive = extractConcept(parsed.graph, 'object', propertyShape, shacl('minInclusive'), null, true);
                const maxInclusive = extractConcept(parsed.graph, 'object', propertyShape, shacl('maxInclusive'), null, true);
                const order = extractConcept(parsed.graph, 'object', propertyShape, shacl('order'), null, true);
                const pattern = extractConcept(parsed.graph, 'object', propertyShape, shacl('pattern'), null, true);
                const datatype = extractConcept(parsed.graph, 'object', propertyShape, shacl('datatype'), null, true);
                const classNode = extractConcept(parsed.graph, 'object', propertyShape, shacl('class'), null, true);
                const placeholder = extractConcept(parsed.graph, 'object', propertyShape, orkgp(PREDICATES.PLACEHOLDER), null, true);
                const shapeDescription = extractConcept(parsed.graph, 'object', propertyShape, shacl('description'), null, true);
                if (classNode) {
                    mappedRange = await mapClass(parsed.graph, classNode);
                } else {
                    mappedRange = await mapClass(parsed.graph, datatype, null, true);
                }
                return {
                    path: predicate,
                    minCount: minCount?.value,
                    maxCount: maxCount?.value,
                    min_inclusive: minInclusive?.value,
                    max_inclusive: maxInclusive?.value,
                    order: order?.value,
                    pattern: pattern?.value,
                    range: mappedRange,
                    placeholder: placeholder?.value,
                    description: shapeDescription?.value,
                };
            });
            let propertyShapesObj = await Promise.all(propertyShapes);
            propertyShapesObj = sortBy(propertyShapesObj ?? [], 'order');
            result.push({
                label: templateLabel?.value ?? extractLabelFromRdfURI(nodesShape.value),
                description: description?.value,
                formattedLabel: formattedLabel?.value,
                templatePredicate,
                researchFields,
                researchProblems,
                closed: closed?.value,
                targetClass,
                propertyShapes: propertyShapesObj,
                targetClassHasAlreadyTemplate,
                existingTemplateId,
            });
            return null;
        });
        await Promise.all(nodesShapes);
        return result;
    };

    const importTemplates = async (data) => {
        const result = [];
        const saveNodeShapesCalls = data
            .filter((nShape) => !nShape.targetClassHasAlreadyTemplate)
            .map(async (nodesShape) => {
                let { targetClass, templatePredicate } = nodesShape;
                if (!targetClass.id) {
                    const targetClassId = await createClass(nodesShape.targetClass.label, nodesShape.targetClass.uri);
                    targetClass = await getClassById(targetClassId);
                }
                if (templatePredicate?.label && !templatePredicate.id) {
                    const newPredicateId = await createPredicate(nodesShape.templatePredicate?.label);
                    templatePredicate = await getPredicate(newPredicateId);
                }

                const mappingPredicates = await Promise.all(
                    nodesShape.propertyShapes.map(async (propertyShape) => {
                        if (!propertyShape.path.id) {
                            const newPid = await createPredicate(propertyShape.path.label);
                            return getPredicate(newPid).then((r) => ({ ...propertyShape.path, ...r }));
                        }
                        return propertyShape.path;
                    }),
                );
                const mappingClasses = await Promise.all(
                    nodesShape.propertyShapes.map(async (propertyShape) => {
                        const { range } = propertyShape;
                        if (!propertyShape.range?.id && propertyShape.range?.label) {
                            if (propertyShape.range.uri) {
                                let fetchedClass;
                                try {
                                    fetchedClass = await getClasses({ uri: propertyShape.range.uri });
                                } catch {
                                    fetchedClass = null;
                                }
                                if (fetchedClass) {
                                    return fetchedClass;
                                }
                            }
                            const newClassId = await createClass(propertyShape.range.label, propertyShape.range.uri);
                            return getClassById(newClassId);
                        }
                        return range;
                    }),
                );

                // Prepare the object for the import
                const templateObject = {
                    label: nodesShape.label,
                    description: nodesShape.description,
                    ...(nodesShape.formattedLabel && {
                        formatted_label: format(
                            nodesShape.formattedLabel,
                            Object.assign({}, ...mappingPredicates.map((p) => ({ [p.extractedId]: `{${p.id}}` }))),
                        ),
                    }),
                    target_class: targetClass.id,
                    relations: {
                        ...(nodesShape.researchFields?.length > 0
                            ? {
                                  research_fields: nodesShape.researchFields
                                      .filter((researchField) => researchField.id)
                                      .map((researchField) => researchField?.id),
                              }
                            : { research_fields: [] }),
                        ...(nodesShape.researchProblems?.length > 0
                            ? {
                                  research_problems: nodesShape.researchProblems
                                      .filter((researchProblem) => researchProblem.id)
                                      .map((researchProblem) => researchProblem?.id),
                              }
                            : { research_problems: [] }),
                        ...(templatePredicate && { predicate: templatePredicate.id }),
                    },
                    properties: nodesShape.propertyShapes.map((propertyShape, index) => ({
                        label: 'Property shape',
                        ...(propertyShape.placeholder && {
                            placeholder: propertyShape.placeholder,
                        }),
                        ...(propertyShape.description && {
                            description: propertyShape.description,
                        }),
                        ...(propertyShape.minCount && {
                            min_count: propertyShape.minCount,
                        }),
                        ...(propertyShape.maxCount && {
                            max_count: propertyShape.maxCount,
                        }),
                        ...(mappingPredicates[index] && {
                            path: mappingPredicates[index].id,
                        }),
                        ...(mappingClasses[index]?.id &&
                            ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(mappingClasses[index].id) && {
                                datatype: mappingClasses[index].id,
                            }),
                        ...(mappingClasses[index]?.id &&
                            !['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(mappingClasses[index].id) && {
                                class: mappingClasses[index].id,
                            }),
                        ...(mappingClasses[index]?.id &&
                            ['Decimal', 'Integer'].includes(mappingClasses[index].id) && {
                                min_inclusive: propertyShape.min_inclusive,
                                max_inclusive: propertyShape.max_inclusive,
                            }),
                        ...(mappingClasses[index]?.id &&
                            !['String'].includes(mappingClasses[index].id) && {
                                pattern: propertyShape.pattern,
                            }),
                    })),
                    is_closed: nodesShape.closed,
                    observatories: observatoryId ? [observatoryId] : [],
                    organizations: organizationId ? [organizationId] : [],
                };

                const templateResource = await createTemplate(templateObject);
                result.push(templateResource);
                return templateResource;
            });
        await Promise.all(saveNodeShapesCalls);
        const newTemplates = await Promise.all(result.map((t) => getTemplate(t)));
        return newTemplates;
    };
    return { parseTemplates, importTemplates };
};

export default useImportSHACL;
