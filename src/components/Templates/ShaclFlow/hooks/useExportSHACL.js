import { useState } from 'react';
import { useSelector } from 'react-redux';
import rdf from 'rdf';
import { isEmpty } from 'lodash';
import { loadTemplateFlowByID } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { convertTreeToFlat } from 'utils';

function downloadN3(graph, turtleName) {
    const a = document.createElement('a');

    // Create the RDF file
    const file = new Blob(
        [
            graph
                .toArray()
                .map(t => t.toString())
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
    const templateID = useSelector(state => state.templateEditor.templateID);

    const convertFlowToSHACL = templateFlow => {
        const graph = new rdf.Graph();
        const shacl = rdf.ns('http://www.w3.org/ns/shacl#');
        const orkgr = rdf.ns('http://orkg.org/orkg/resource/');
        const orkgc = rdf.ns('http://orkg.org/orkg/class/');
        const orkgp = rdf.ns('http://orkg.org/orkg/predicate/');
        const owl = rdf.ns('http://www.w3.org/2002/07/owl#');
        templateFlow.map(template => {
            // NodeShape
            graph.add(new rdf.Triple(orkgr(template.id), rdf.rdfns('type'), shacl('NodeShape')));
            graph.add(new rdf.Triple(orkgr(template.id), rdf.rdfsns('label'), new rdf.Literal(template.label)));
            graph.add(new rdf.Triple(orkgr(template.id), shacl('targetClass'), orkgc(template.class.id.toString())));
            graph.add(new rdf.Triple(orkgc(template.class.id.toString()), rdf.rdfsns('label'), new rdf.Literal(template.class.label)));
            if (template.class.uri) {
                graph.add(new rdf.Triple(orkgc(template.class.id.toString()), owl('equivalentClass'), new rdf.NamedNode(template.class.uri)));
            }
            graph.add(new rdf.Triple(orkgr(template.id), shacl('closed'), new rdf.Literal(template.isClosed.toString(), rdf.xsdns('boolean'))));
            if (template.labelFormat) {
                graph.add(
                    new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_LABEL_FORMAT), new rdf.Literal(template.labelFormat.toString())),
                );
            }
            if (template.description) {
                graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.DESCRIPTION), new rdf.Literal(template.description.toString())));
            }
            if (template.predicate) {
                graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_PREDICATE), orkgp(template.predicate.id)));
                graph.add(new rdf.Triple(orkgp(template.predicate.id), rdf.rdfsns('label'), new rdf.Literal(template.predicate.label)));
            }
            if (template.researchFields?.length > 0) {
                template.researchFields.map(researchField => {
                    graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_FIELD), orkgr(researchField.id)));
                    graph.add(new rdf.Triple(orkgr(researchField.id), rdf.rdfsns('label'), new rdf.Literal(researchField.label)));
                    graph.add(new rdf.Triple(orkgr(researchField.id), rdf.rdfns('type'), orkgc(CLASSES.RESEARCH_FIELD)));
                    return null;
                });
            }
            if (template.researchProblems?.length > 0) {
                template.researchProblems.map(researchProblem => {
                    graph.add(new rdf.Triple(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), orkgr(researchProblem.id)));
                    graph.add(new rdf.Triple(orkgr(researchProblem.id), rdf.rdfsns('label'), new rdf.Literal(researchProblem.label)));
                    graph.add(new rdf.Triple(orkgr(researchProblem.id), rdf.rdfns('type'), orkgc(CLASSES.PROBLEM)));
                    return null;
                });
            }
            // PropertyShapes
            template.propertyShapes.map(propertyShape => {
                const propertyShapeNode = new rdf.BlankNode();
                graph.add(new rdf.Triple(orkgr(template.id), shacl('property'), propertyShapeNode));
                graph.add(new rdf.Triple(propertyShapeNode, rdf.rdfns('type'), shacl('PropertyShape')));
                graph.add(new rdf.Triple(propertyShapeNode, shacl('path'), orkgp(propertyShape.property.id)));
                graph.add(new rdf.Triple(orkgp(propertyShape.property.id), rdf.rdfsns('label'), new rdf.Literal(propertyShape.property.label)));

                if (!isEmpty(propertyShape.minCount)) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('minCount'), new rdf.Literal(propertyShape.minCount, rdf.xsdns('integer'))));
                }

                if (propertyShape.maxCount) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('maxCount'), new rdf.Literal(propertyShape.maxCount, rdf.xsdns('integer'))));
                }

                if (propertyShape.value?.id && !['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.value.id)) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('class'), orkgc(propertyShape.value.id.toString())));
                    graph.add(
                        new rdf.Triple(orkgc(propertyShape.value.id.toString()), rdf.rdfsns('label'), new rdf.Literal(propertyShape.value.label)),
                    );
                    if (propertyShape.value.uri) {
                        graph.add(
                            new rdf.Triple(
                                orkgc(propertyShape.value.id.toString()),
                                owl('equivalentClass'),
                                new rdf.NamedNode(propertyShape.value.uri),
                            ),
                        );
                    }
                }

                if (propertyShape.value?.id && ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.value.id)) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('datatype'), orkgc(propertyShape.value.id.toString())));
                    graph.add(
                        new rdf.Triple(orkgc(propertyShape.value.id.toString()), rdf.rdfsns('label'), new rdf.Literal(propertyShape.value.label)),
                    );
                    if (propertyShape.value.uri) {
                        graph.add(
                            new rdf.Triple(
                                orkgc(propertyShape.value.id.toString()),
                                owl('equivalentClass'),
                                new rdf.NamedNode(propertyShape.value.uri),
                            ),
                        );
                    }
                }

                if (propertyShape.pattern) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('pattern'), new rdf.Literal(propertyShape.pattern)));
                }
                if (propertyShape.order) {
                    graph.add(new rdf.Triple(propertyShapeNode, shacl('order'), new rdf.Literal(propertyShape.order, rdf.xsdns('integer'))));
                }
                if (!isEmpty(propertyShape.minInclusive)) {
                    graph.add(
                        new rdf.Triple(propertyShapeNode, shacl('minInclusive'), new rdf.Literal(propertyShape.minInclusive, rdf.xsdns('integer'))),
                    );
                }
                if (propertyShape.maxInclusive) {
                    graph.add(
                        new rdf.Triple(propertyShapeNode, shacl('maxInclusive'), new rdf.Literal(propertyShape.maxInclusive, rdf.xsdns('integer'))),
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
        const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter(n => !isEmpty(n))];
        const graph = await convertFlowToSHACL(flattenNodes);
        setIsConvertingToSHACL(false);
        downloadN3(graph, `template-${templateID}.n3`);
    };

    return { exportSHACL, isConvertingToSHACL };
};

export default useExportSHACL;
