import { BlankNode, DataFactory, NamedNode, Store, Writer } from 'n3';

import useComparisonExport from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { LICENSE_URL } from '@/constants/misc';

const { namedNode, literal, blankNode, quad } = DataFactory;

const useRdfExport = () => {
    const { comparison, comparisonContents, selectedPathsFlattened } = useComparison();
    const { table } = useComparisonExport();

    const generateRdfDataVocabularyFile = () => {
        if (!comparison || !comparisonContents) {
            return;
        }

        const element = document.createElement('a');

        // Namespace helper functions
        const cubens = (term: string) => namedNode(`http://purl.org/linked-data/cube#${term}`);
        const orkgVocab = (term: string) => namedNode(`https://orkg.org/vocab/#${term}`);
        const orkgResource = (term: string) => namedNode(`https://orkg.org/resource/${term}`);
        const rdfsns = (term: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${term}`);
        const rdfns = (term: string) => namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${term}`);
        const dcterms = (term: string) => namedNode(`http://purl.org/dc/terms/#${term}`);

        const store = new Store();
        // Vocabulary properties labels
        store.addQuad(quad(cubens('dataSet'), rdfsns('label'), literal('dataSet')));
        store.addQuad(quad(cubens('structure'), rdfsns('label'), literal('structure')));
        store.addQuad(quad(cubens('component'), rdfsns('label'), literal('component')));
        store.addQuad(quad(cubens('componentProperty'), rdfsns('label'), literal('component Property')));
        store.addQuad(quad(cubens('componentAttachment'), rdfsns('label'), literal('component Attachment')));
        store.addQuad(quad(cubens('dimension'), rdfsns('label'), literal('dimension')));
        store.addQuad(quad(cubens('attribute'), rdfsns('label'), literal('attribute')));
        store.addQuad(quad(cubens('measure'), rdfsns('label'), literal('measure')));
        store.addQuad(quad(cubens('order'), rdfsns('label'), literal('order')));
        // BNodes
        const ds = blankNode();
        const dsd = blankNode();
        // Dataset
        store.addQuad(quad(ds, rdfns('type'), cubens('DataSet')));
        // Metadata
        store.addQuad(quad(ds, dcterms('title'), literal(comparison.title ? comparison.title : 'Comparison - ORKG')));
        store.addQuad(quad(ds, dcterms('description'), literal(comparison.description ? comparison.description : 'Description')));
        store.addQuad(quad(ds, dcterms('creator'), literal(comparison.created_by ? comparison.created_by : 'Creator')));
        store.addQuad(quad(ds, dcterms('date'), literal(comparison.created_at ? comparison.created_at : 'Date')));
        store.addQuad(quad(ds, dcterms('license'), namedNode(LICENSE_URL)));
        store.addQuad(quad(ds, rdfsns('label'), literal('Comparison - ORKG')));
        store.addQuad(quad(ds, cubens('structure'), dsd));
        // DataStructureDefinition
        store.addQuad(quad(dsd, rdfns('type'), cubens('DataStructureDefinition')));
        store.addQuad(quad(dsd, rdfsns('label'), literal('Data Structure Definition')));

        const cs: { [key: string]: BlankNode } = {};
        const dt: { [key: string]: NamedNode } = {};

        // components
        const columns = comparisonContents.titles.map((title, i) => ({
            title,
            subtitle: comparisonContents.subtitles[i] ?? null,
        }));
        const columnsWithProps = [{ title: { id: 'Properties', label: 'Properties' }, subtitle: null }, ...columns];

        columnsWithProps.forEach((column, index) => {
            const id = column.subtitle?.id ?? column.title.id;

            if (id === 'Properties') {
                cs.Properties = blankNode();
                dt.Properties = orkgVocab('Property');
            } else {
                cs[id] = blankNode();
                dt[id] = orkgResource(`${id}`);
            }

            store.addQuad(quad(dsd, cubens('component'), cs[id]));
            store.addQuad(quad(cs[id], rdfns('type'), cubens('ComponentSpecification')));
            store.addQuad(quad(cs[id], rdfsns('label'), literal('Component Specification')));
            store.addQuad(quad(cs[id], cubens('order'), literal(index.toString())));
            if (id === 'Properties') {
                store.addQuad(quad(cs.Properties, cubens('dimension'), dt.Properties));
                store.addQuad(quad(dt.Properties, rdfns('type'), cubens('DimensionProperty')));
            } else {
                store.addQuad(quad(cs[id], cubens('measure'), dt[id]));
                store.addQuad(quad(dt[id], rdfns('type'), cubens('MeasureProperty')));
            }
            store.addQuad(quad(dt[id], rdfns('type'), cubens('ComponentProperty')));
            store.addQuad(quad(dt[id], rdfsns('label'), literal(column?.subtitle?.label?.toString() ?? column?.title?.label?.toString() ?? '')));
        });

        selectedPathsFlattened.forEach((path, index) => {
            const bno = blankNode();
            store.addQuad(quad(bno, rdfns('type'), cubens('Observation')));
            store.addQuad(quad(bno, rdfsns('label'), literal(`Observation #{${index + 1}}`)));
            store.addQuad(quad(bno, cubens('dataSet'), ds));
            store.addQuad(quad(bno, dt.Properties, literal(path.label.toString())));

            table[0]?.values.forEach((_, colIndex) => {
                table
                    .filter((row) => row.pathId === path.id)
                    .forEach((row) => {
                        const column = columnsWithProps[colIndex + 1];
                        const value = row.values[colIndex];

                        if (value?._class === 'resource_ref') {
                            store.addQuad(quad(bno, dt[column.subtitle?.id ?? column.title.id], orkgResource(`${value.id}`)));
                        } else if (value?._class === 'literal_ref') {
                            store.addQuad(quad(bno, dt[column.subtitle?.id ?? column.title.id], literal(`${value.label ? value.label : ''}`)));
                        }
                    });
            });
        });
        const writer = new Writer({ format: 'N3' });

        // Add all quads from the store to the writer
        const quads = store.getQuads(null, null, null, null);
        writer.addQuads(quads);

        writer.end((error, result) => {
            if (error) {
                console.error('Error serializing RDF:', error);
                return;
            }

            const file = new Blob([result], { type: 'text/n3' });
            element.href = URL.createObjectURL(file);
            element.download = 'ComparisonRDF.n3';
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        });
    };

    return { generateRdfDataVocabularyFile };
};

export default useRdfExport;
