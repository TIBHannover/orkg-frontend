import { isEmpty } from 'lodash';
import rdf from 'rdf';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { loadTemplateFlowByID } from '@/services/backend/statements';
import { convertTreeToFlat } from '@/utils';

function downloadN3(graph, turtleName) {
    const a = document.createElement('a');

    // Create the RDF file
    const file = new Blob(
        [
            graph
                .toArray()
                .map((t) => t.toString())
                .join('\n'),
        ],
        { type: 'text/n3' },
    );
    a.href = URL.createObjectURL(file);
    a.download = turtleName;
    document.body.appendChild(a); // Required for this to work in FireFox
    a.click();
}

const useExportSHACL = () => {
    const [isConvertingToSHACL, setIsConvertingToSHACL] = useState(false);
    const templateID = useSelector((state) => state.templateEditor.id);

    const convertFlowToSHACL = (templateFlow) => {
        const graph = new rdf.Graph();
        const shacl = rdf.ns('http://www.w3.org/ns/shacl#');
        const orkgr = rdf.ns('http://orkg.org/orkg/resource/');
        const orkgc = rdf.ns('http://orkg.org/orkg/class/');
        const orkgp = rdf.ns('http://orkg.org/orkg/predicate/');
        const owl = rdf.ns('http://www.w3.org/2002/07/owl#');
        templateFlow.map((template) => {
            // NodeShape
            graph.add(new rdf.Triple(orkgr(template.id), rdf.rdfns('type'), shacl('NodeShape')));
            graph.add(new rdf.Triple(orkgr(template.id), rdf.rdfsns('label'), new rdf.Literal(template.label)));
            graph.add(new rdf.Triple(orkgr(template.id), shacl('targetClass'), orkgc(template.target_class.id.toString())));
            graph.add(new rdf.Triple(orkgc(template.target_class.id.toString()), rdf.rdfsns('label'), new rdf.Literal(template.target_class.label)));
            if (template.target_class.uri) {
                graph.add(
                    new rdf.Triple(orkgc(template.target_class.id.toString()), owl('equivalentClass'), new rdf.NamedNode(template.target_class.uri)),
                );
            }
            graph.add(new rdf.Triple(orkgr(template.id), shacl('closed'), new rdf.Literal(template.is_closed.toString(), rdf.xsdns('boolean'))));
            if (template.formatted_label) {
                graph.add(
                    new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_LABEL_FORMAT), new rdf.Literal(template.formatted_label.toString())),
                );
            }
            if (template.description) {
                graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.DESCRIPTION), new rdf.Literal(template.description.toString())));
            }
            if (template.relations.predicate) {
                graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_PREDICATE), orkgp(template.relations.predicate.id)));
                graph.add(
                    new rdf.Triple(orkgp(template.relations.predicate.id), rdf.rdfsns('label'), new rdf.Literal(template.relations.predicate.label)),
                );
            }
            if (template.relations.research_fields?.length > 0) {
                template.relations.research_fields.map((researchField) => {
                    graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_FIELD), orkgr(researchField.id)));
                    graph.add(new rdf.Triple(orkgr(researchField.id), rdf.rdfsns('label'), new rdf.Literal(researchField.label)));
                    graph.add(new rdf.Triple(orkgr(researchField.id), rdf.rdfns('type'), orkgc(CLASSES.RESEARCH_FIELD)));
                    return null;
                });
            }
            if (template.relations.researchProblems?.length > 0) {
                template.relations.research_problems.map((researchProblem) => {
                    graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), orkgr(researchProblem.id)));
                    graph.add(new rdf.Triple(orkgr(researchProblem.id), rdf.rdfsns('label'), new rdf.Literal(researchProblem.label)));
                    graph.add(new rdf.Triple(orkgr(researchProblem.id), rdf.rdfns('type'), orkgc(CLASSES.PROBLEM)));
                    return null;
                });
            }
            // PropertyShapes
            template.properties.map((propertyShape) => {
                const propertyShapeNode = new rdf.BlankNode();
                graph.add(new rdf.Triple(orkgr(template.id), shacl('property'), propertyShapeNode));
                graph.add(new rdf.Triple(propertyShapeNode, rdf.rdfns('type'), shacl('PropertyShape')));
                graph.add(new rdf.Triple(propertyShapeNode, shacl('path'), orkgp(propertyShape.path.id)));
                graph.add(new rdf.Triple(orkgp(propertyShape.path.id), rdf.rdfsns('label'), new rdf.Literal(propertyShape.path.label)));

                if (!isEmpty(propertyShape.min_count?.toString())) {
                    graph.add(
                        new rdf.Triple(
                            propertyShapeNode,
                            shacl('minCount'),
                            new rdf.Literal(propertyShape.min_count.toString(), rdf.xsdns('integer')),
                        ),
                    );
                }

                if (propertyShape.max_count) {
                    graph.add(
                        new rdf.Triple(
                            propertyShapeNode,
                            shacl('maxCount'),
                            new rdf.Literal(propertyShape.max_count.toString(), rdf.xsdns('integer')),
                        ),
                    );
                }

                if (propertyShape.placeholder) {
                    graph.add(new rdf.Triple(propertyShapeNode, orkgp(PREDICATES.PLACEHOLDER), new rdf.Literal(propertyShape.placeholder)));
                }

                if (propertyShape.description) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('description'), new rdf.Literal(propertyShape.description)));
                }

                if (propertyShape.class?.id && !['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.class.id)) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('class'), orkgc(propertyShape.class.id.toString())));
                    graph.add(
                        new rdf.Triple(orkgc(propertyShape.class.id.toString()), rdf.rdfsns('label'), new rdf.Literal(propertyShape.class.label)),
                    );
                    if (propertyShape.class.uri) {
                        graph.add(
                            new rdf.Triple(
                                orkgc(propertyShape.class.id.toString()),
                                owl('equivalentClass'),
                                new rdf.NamedNode(propertyShape.class.uri),
                            ),
                        );
                    }
                }

                if (propertyShape.datatype?.id && ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.datatype.id)) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('datatype'), orkgc(propertyShape.datatype.id.toString())));
                    graph.add(
                        new rdf.Triple(
                            orkgc(propertyShape.datatype.id.toString()),
                            rdf.rdfsns('label'),
                            new rdf.Literal(propertyShape.datatype.label),
                        ),
                    );
                    if (propertyShape.datatype.uri) {
                        graph.add(
                            new rdf.Triple(
                                orkgc(propertyShape.datatype.id.toString()),
                                owl('equivalentClass'),
                                new rdf.NamedNode(propertyShape.datatype.uri),
                            ),
                        );
                    }
                }

                if (propertyShape.pattern) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('pattern'), new rdf.Literal(propertyShape.pattern)));
                }
                if (propertyShape.order) {
                    graph.add(
                        new rdf.Triple(propertyShapeNode, shacl('order'), new rdf.Literal(propertyShape.order.toString(), rdf.xsdns('integer'))),
                    );
                }
                if (!isEmpty(propertyShape.min_inclusive?.toString())) {
                    graph.add(
                        new rdf.Triple(
                            propertyShapeNode,
                            shacl('minInclusive'),
                            new rdf.Literal(propertyShape.min_inclusive.toString(), rdf.xsdns('integer')),
                        ),
                    );
                }
                if (propertyShape.max_inclusive) {
                    graph.add(
                        new rdf.Triple(
                            propertyShapeNode,
                            shacl('maxInclusive'),
                            new rdf.Literal(propertyShape.max_inclusive.toString(), rdf.xsdns('integer')),
                        ),
                    );
                }
                return null;
            });
            return null;
        });
        return graph;
    };

    const exportSHACL = async () => {
        setIsConvertingToSHACL(true);
        const templatesFlow = await loadTemplateFlowByID(templateID, new Set());
        const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter((n) => !isEmpty(n))];
        const graph = await convertFlowToSHACL(flattenNodes);
        setIsConvertingToSHACL(false);
        downloadN3(graph, `template-${templateID}.n3`);
    };

    return { exportSHACL, isConvertingToSHACL };
};

export default useExportSHACL;
