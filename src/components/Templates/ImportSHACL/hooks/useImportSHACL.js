import { extractConcept, extractLabelFromRdfURI, mapClass, mapPredicate, mapResource } from 'components/Templates/ImportSHACL/helpers/helpers';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import rdf from 'rdf';
import { createClass } from 'services/backend/classes';
import { createObject } from 'services/backend/misc';
import { createPredicate } from 'services/backend/predicates';
import { createResourceStatement, getTemplatesByClass, createLiteralStatement } from 'services/backend/statements';
import format from 'string-format';
import { createLiteral } from 'services/backend/literals';

const useImportSHACL = () => {
    const parseTemplates = async text => {
        const result = [];
        // initialize
        const shacl = rdf.ns('http://www.w3.org/ns/shacl#');
        const orkgp = rdf.ns('http://orkg.org/orkg/predicate/');
        const parsed = rdf.TurtleParser.parse(text);
        const nodesShapesNodes = extractConcept(parsed.graph, 'subject', null, rdf.rdfns('type'), shacl('NodeShape'), false);
        // NodeShapes
        const nodesShapes = nodesShapesNodes.map(async nodesShape => {
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
                    researchFields.map(async researchField => mapResource(parsed.graph, researchField, [CLASSES.RESEARCH_FIELD])),
                );
            }
            // ResearchProblem
            let researchProblems = extractConcept(parsed.graph, 'object', nodesShape, orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), null, false);
            if (researchProblems?.length > 0) {
                researchProblems = await Promise.all(
                    researchProblems.map(async researchProblem => mapResource(parsed.graph, researchProblem, [CLASSES.PROBLEM])),
                );
            }
            const closed = extractConcept(parsed.graph, 'object', nodesShape, shacl('closed'), null, true);
            // PropertyShapes
            let propertyShapes = extractConcept(parsed.graph, 'object', nodesShape, shacl('property'), null, false);

            propertyShapes = propertyShapes.map(async propertyShape => {
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
                if (classNode) {
                    mappedRange = await mapClass(parsed.graph, classNode);
                } else {
                    mappedRange = await mapClass(parsed.graph, datatype, null, true);
                }
                return {
                    property: predicate,
                    minCount: minCount?.value,
                    maxCount: maxCount?.value,
                    minInclusive: minInclusive?.value,
                    maxInclusive: maxInclusive?.value,
                    order: order?.value,
                    pattern: pattern?.value,
                    range: mappedRange,
                };
            });
            const propertyShapesObj = await Promise.all(propertyShapes);
            result.push({
                label: templateLabel?.value ?? extractLabelFromRdfURI(nodesShape.value),
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

    const importTemplates = async data => {
        const result = [];
        const saveNodeShapesCalls = data
            .filter(nShape => !nShape.targetClassHasAlreadyTemplate)
            .map(async nodesShape => {
                let { targetClass, templatePredicate } = nodesShape;
                if (!targetClass.id) {
                    targetClass = await createClass(nodesShape.targetClass.label, nodesShape.targetClass.uri);
                }
                if (templatePredicate?.label && !templatePredicate.id) {
                    templatePredicate = await createPredicate(nodesShape.templatePredicate?.label);
                }
                // Prepare the object for the import
                const nodeShapeObject = {
                    predicates: [],
                    resource: {
                        name: nodesShape.label,
                        classes: [CLASSES.NODE_SHAPE],
                        values: {
                            [PREDICATES.SHACL_CLOSED]: [
                                {
                                    text: nodesShape.closed,
                                    datatype: 'xsd:boolean',
                                },
                            ],
                            [PREDICATES.SHACL_TARGET_CLASS]: [
                                {
                                    '@id': targetClass.id,
                                    '@type': ENTITIES.CLASS,
                                },
                            ],
                            ...(templatePredicate && {
                                [PREDICATES.TEMPLATE_OF_PREDICATE]: [
                                    {
                                        '@id': templatePredicate.id,
                                        '@type': ENTITIES.PREDICATE,
                                    },
                                ],
                            }),
                            ...(nodesShape.researchFields?.length > 0 && {
                                [PREDICATES.TEMPLATE_OF_RESEARCH_FIELD]: nodesShape.researchFields
                                    .filter(researchField => researchField.id)
                                    .map(researchField => ({
                                        '@id': researchField?.id,
                                        '@type': ENTITIES.RESOURCE,
                                    })),
                            }),
                            ...(nodesShape.researchProblems?.length > 0 && {
                                [PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM]: nodesShape.researchProblems
                                    .filter(researchProblem => researchProblem.id)
                                    .map(researchProblem => ({
                                        '@id': researchProblem?.id,
                                        '@type': ENTITIES.RESOURCE,
                                    })),
                            }),
                        },
                    },
                };
                const templateResource = await createObject(nodeShapeObject);
                const mappingPredicates = [];
                const propertyShapesAPICalls = nodesShape.propertyShapes.map(async propertyShape => {
                    let predicate = propertyShape.property;
                    if (!propertyShape.property.id) {
                        predicate = { extractedId: propertyShape.property.extractedId, ...(await createPredicate(propertyShape.property.label)) };
                    }
                    mappingPredicates.push(predicate);
                    let { range } = propertyShape;
                    if (!propertyShape.range?.id && propertyShape.range?.label) {
                        range = await createClass(propertyShape.range.label, propertyShape.range.uri);
                    }
                    // Prepare the object for the import
                    const propertyShapeObject = {
                        predicates: [],
                        resource: {
                            name: 'Property shape',
                            classes: [CLASSES.PROPERTY_SHAPE],
                            values: {
                                [PREDICATES.SHACL_PATH]: [
                                    {
                                        '@id': predicate.id,
                                        '@type': ENTITIES.PREDICATE,
                                    },
                                ],
                                ...(range?.id && {
                                    [['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(range.id)
                                        ? PREDICATES.SHACL_DATATYPE
                                        : PREDICATES.SHACL_CLASS]: [
                                        {
                                            '@id': range.id,
                                            '@type': ENTITIES.CLASS,
                                        },
                                    ],
                                }),
                                ...(propertyShape.minCount && {
                                    [PREDICATES.SHACL_MIN_COUNT]: [
                                        {
                                            text: propertyShape.minCount,
                                            datatype: 'xsd:integer',
                                        },
                                    ],
                                }),
                                ...(propertyShape.maxCount && {
                                    [PREDICATES.SHACL_MAX_COUNT]: [
                                        {
                                            text: propertyShape.maxCount,
                                            datatype: 'xsd:integer',
                                        },
                                    ],
                                }),
                                ...(propertyShape.order
                                    ? {
                                          [PREDICATES.SHACL_ORDER]: [
                                              {
                                                  text: propertyShape.order,
                                                  datatype: 'xsd:integer',
                                              },
                                          ],
                                      }
                                    : {}),
                                ...(propertyShape.range?.id &&
                                ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.range.id)
                                    ? {
                                          ...(propertyShape.minInclusive && {
                                              [PREDICATES.SHACL_MIN_INCLUSIVE]: [
                                                  {
                                                      text: propertyShape.minInclusive,
                                                      datatype: 'xsd:integer',
                                                  },
                                              ],
                                          }),
                                          ...(propertyShape.maxInclusive && {
                                              [PREDICATES.SHACL_MAX_INCLUSIVE]: [
                                                  {
                                                      text: propertyShape.maxInclusive,
                                                      datatype: 'xsd:integer',
                                                  },
                                              ],
                                          }),
                                          ...(propertyShape.pattern && {
                                              [PREDICATES.SHACL_PATTERN]: [
                                                  {
                                                      text: propertyShape.pattern,
                                                      datatype: 'xsd:string',
                                                  },
                                              ],
                                          }),
                                      }
                                    : {}),
                            },
                        },
                    };

                    // create the propertyShape using createObject endpoint
                    return createObject(propertyShapeObject);
                });
                // Adapt the formatted label to the new ids
                if (nodesShape.formattedLabel) {
                    const formattedLabel = format(
                        nodesShape.formattedLabel,
                        Object.assign({}, ...mappingPredicates.map(p => ({ [p.extractedId]: `{${p.id}}` }))),
                    );
                    const responseJsonFormattedLabel = await createLiteral(formattedLabel);
                    await createLiteralStatement(templateResource.id, PREDICATES.TEMPLATE_LABEL_FORMAT, responseJsonFormattedLabel.id);
                }
                const propertyShapes = await Promise.all(propertyShapesAPICalls);
                // link components to the template
                propertyShapes.map(c => createResourceStatement(templateResource.id, PREDICATES.SHACL_PROPERTY, c.id));
                result.push(templateResource);
                return templateResource;
            });
        await Promise.all(saveNodeShapesCalls);
        return result;
    };
    return { parseTemplates, importTemplates };
};

export default useImportSHACL;
