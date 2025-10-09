import { isEmpty } from 'lodash';
import { DataFactory, Store, Writer } from 'n3';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { loadTemplateFlowByID } from '@/services/backend/statements';
import { convertTreeToFlat } from '@/utils';

const { namedNode, literal, blankNode, quad } = DataFactory;

// Type definitions
interface Template {
    id: string;
    label: string;
    target_class: {
        id: string;
        label: string;
        uri?: string;
    };
    is_closed: boolean;
    formatted_label?: string;
    description?: string;
    relations: {
        research_fields?: Array<{
            id: string;
            label: string;
        }>;
        research_problems?: Array<{
            id: string;
            label: string;
        }>;
    };
    properties: Array<{
        path: {
            id: string;
            label: string;
        };
        min_count?: number;
        max_count?: number;
        placeholder?: string;
        description?: string;
        class?: {
            id: string;
            label: string;
            uri?: string;
        };
        datatype?: {
            id: string;
            label: string;
            uri?: string;
        };
        pattern?: string;
        order?: number;
        min_inclusive?: number;
        max_inclusive?: number;
    }>;
}

function downloadN3(store: Store, turtleName: string): void {
    const a = document.createElement('a');
    const writer = new Writer({ format: 'N3' });

    // Create the RDF file
    store.forEach((quadItem) => {
        writer.addQuad(quadItem);
    });

    writer.end((error, result) => {
        if (error) {
            console.error('Error serializing RDF:', error);
            return;
        }

        const file = new Blob([result], { type: 'text/n3' });
        a.href = URL.createObjectURL(file);
        a.download = turtleName;
        document.body.appendChild(a); // Required for this to work in FireFox
        a.click();
    });
}

const useExportSHACL = () => {
    const [isConvertingToSHACL, setIsConvertingToSHACL] = useState(false);
    const templateID = useSelector((state: any) => state.templateEditor.id);

    const convertFlowToSHACL = (templateFlow: Template[]): Store => {
        const store = new Store();
        const shacl = (suffix: string) => namedNode(`http://www.w3.org/ns/shacl#${suffix}`);
        const orkgr = (suffix: string) => namedNode(`http://orkg.org/orkg/resource/${suffix}`);
        const orkgc = (suffix: string) => namedNode(`http://orkg.org/orkg/class/${suffix}`);
        const orkgp = (suffix: string) => namedNode(`http://orkg.org/orkg/predicate/${suffix}`);
        const owl = (suffix: string) => namedNode(`http://www.w3.org/2002/07/owl#${suffix}`);
        const rdf = (suffix: string) => namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${suffix}`);
        const rdfs = (suffix: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${suffix}`);
        const xsd = (suffix: string) => namedNode(`http://www.w3.org/2001/XMLSchema#${suffix}`);
        templateFlow.map((template: Template) => {
            // NodeShape
            store.addQuad(quad(orkgr(template.id), rdf('type'), shacl('NodeShape')));
            store.addQuad(quad(orkgr(template.id), rdfs('label'), literal(template.label)));
            store.addQuad(quad(orkgr(template.id), shacl('targetClass'), orkgc(template.target_class.id.toString())));
            store.addQuad(quad(orkgc(template.target_class.id.toString()), rdfs('label'), literal(template.target_class.label)));
            if (template.target_class.uri) {
                store.addQuad(quad(orkgc(template.target_class.id.toString()), owl('equivalentClass'), namedNode(template.target_class.uri)));
            }
            store.addQuad(quad(orkgr(template.id), shacl('closed'), literal(template.is_closed.toString(), xsd('boolean'))));
            if (template.formatted_label) {
                store.addQuad(quad(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_LABEL_FORMAT), literal(template.formatted_label.toString())));
            }
            if (template.description) {
                store.addQuad(quad(orkgr(template.id), orkgp(PREDICATES.DESCRIPTION), literal(template.description.toString())));
            }
            if (template.relations.research_fields && template.relations.research_fields.length > 0) {
                template.relations.research_fields.map((researchField: { id: string; label: string }) => {
                    store.addQuad(quad(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_FIELD), orkgr(researchField.id)));
                    store.addQuad(quad(orkgr(researchField.id), rdfs('label'), literal(researchField.label)));
                    store.addQuad(quad(orkgr(researchField.id), rdf('type'), orkgc(CLASSES.RESEARCH_FIELD)));
                    return null;
                });
            }
            if (template.relations.research_problems && template.relations.research_problems.length > 0) {
                template.relations.research_problems.map((researchProblem: { id: string; label: string }) => {
                    store.addQuad(quad(orkgr(template.id), orkgp(PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM), orkgr(researchProblem.id)));
                    store.addQuad(quad(orkgr(researchProblem.id), rdfs('label'), literal(researchProblem.label)));
                    store.addQuad(quad(orkgr(researchProblem.id), rdf('type'), orkgc(CLASSES.PROBLEM)));
                    return null;
                });
            }
            // PropertyShapes
            template.properties.map((propertyShape: Template['properties'][0]) => {
                const propertyShapeNode = blankNode();
                store.addQuad(quad(orkgr(template.id), shacl('property'), propertyShapeNode));
                store.addQuad(quad(propertyShapeNode, rdf('type'), shacl('PropertyShape')));
                store.addQuad(quad(propertyShapeNode, shacl('path'), orkgp(propertyShape.path.id)));
                store.addQuad(quad(orkgp(propertyShape.path.id), rdfs('label'), literal(propertyShape.path.label)));

                if (propertyShape.min_count && !isEmpty(propertyShape.min_count.toString())) {
                    store.addQuad(quad(propertyShapeNode, shacl('minCount'), literal(propertyShape.min_count.toString(), xsd('integer'))));
                }

                if (propertyShape.max_count) {
                    store.addQuad(quad(propertyShapeNode, shacl('maxCount'), literal(propertyShape.max_count.toString(), xsd('integer'))));
                }

                if (propertyShape.placeholder) {
                    store.addQuad(quad(propertyShapeNode, orkgp(PREDICATES.PLACEHOLDER), literal(propertyShape.placeholder)));
                }

                if (propertyShape.description) {
                    store.addQuad(quad(propertyShapeNode, shacl('description'), literal(propertyShape.description)));
                }

                if (propertyShape.class?.id && !['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.class.id)) {
                    store.addQuad(quad(propertyShapeNode, shacl('class'), orkgc(propertyShape.class.id.toString())));
                    store.addQuad(quad(orkgc(propertyShape.class.id.toString()), rdfs('label'), literal(propertyShape.class.label)));
                    if (propertyShape.class.uri) {
                        store.addQuad(quad(orkgc(propertyShape.class.id.toString()), owl('equivalentClass'), namedNode(propertyShape.class.uri)));
                    }
                }

                if (propertyShape.datatype?.id && ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.datatype.id)) {
                    store.addQuad(quad(propertyShapeNode, shacl('datatype'), orkgc(propertyShape.datatype.id.toString())));
                    store.addQuad(quad(orkgc(propertyShape.datatype.id.toString()), rdfs('label'), literal(propertyShape.datatype.label)));
                    if (propertyShape.datatype.uri) {
                        store.addQuad(
                            quad(orkgc(propertyShape.datatype.id.toString()), owl('equivalentClass'), namedNode(propertyShape.datatype.uri)),
                        );
                    }
                }

                if (propertyShape.pattern) {
                    store.addQuad(quad(propertyShapeNode, shacl('pattern'), literal(propertyShape.pattern)));
                }
                if (propertyShape.order) {
                    store.addQuad(quad(propertyShapeNode, shacl('order'), literal(propertyShape.order.toString(), xsd('integer'))));
                }
                if (propertyShape.min_inclusive && !isEmpty(propertyShape.min_inclusive.toString())) {
                    store.addQuad(quad(propertyShapeNode, shacl('minInclusive'), literal(propertyShape.min_inclusive.toString(), xsd('integer'))));
                }
                if (propertyShape.max_inclusive) {
                    store.addQuad(quad(propertyShapeNode, shacl('maxInclusive'), literal(propertyShape.max_inclusive.toString(), xsd('integer'))));
                }
                return null;
            });
            return null;
        });
        return store;
    };

    const exportSHACL = async (): Promise<void> => {
        setIsConvertingToSHACL(true);
        const templatesFlow = await loadTemplateFlowByID(templateID, new Set());
        const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter((n: any) => !isEmpty(n))];
        const graph = convertFlowToSHACL(flattenNodes);
        setIsConvertingToSHACL(false);
        downloadN3(graph, `template-${templateID}.n3`);
    };

    return { exportSHACL, isConvertingToSHACL };
};

export default useExportSHACL;
