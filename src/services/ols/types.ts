type Classification = {
    collection?: string[];
    subject?: string[];
};

type License = {
    label: string;
    url: string;
};

type LinkedEntity = {
    numAppearsIn?: number;
    hasLocalDefinition?: boolean;
    label?: string[];
    curie?: string;
    type?: string[];
    definedBy?: string[];
    url?: string;
    source?: string;
};

// Base interface with shared attributes
interface BaseOntologyType {
    ontologyId: string;
    imported?: boolean;
    iri?: string;
    isObsolete?: boolean;
    label?: string[];
    language?: string[];
    linkedEntities?: Record<string, LinkedEntity>;
    loaded?: string;
    numDescendants?: number;
    numHierarchicalDescendants?: number;
    numberOfClasses?: string;
    numberOfEntities?: string;
    numberOfIndividuals?: string;
    numberOfProperties?: string;
    searchableAnnotationValues?: (string | boolean)[];
    sourceFileTimestamp?: string;
    type?: string[];
}

// EntityType now extends BaseOntologyType
export type EntityType = BaseOntologyType & {
    appearsIn?: string[];
    curie?: string;
    definedBy?: string[];
    definition?: string[];
    definitionProperty?: string;
    hasDirectChildren?: boolean;
    hasDirectParents?: boolean;
    hasHierarchicalChildren?: boolean;
    hasHierarchicalParents?: boolean;
    ontologyPreferredPrefix?: string;
    shortForm?: string;
    ontologyIri?: string;
    isDefiningOntology?: boolean;
    [key: string]: any; // For additional RDF properties that may be present
};

// OntologyElement now extends BaseOntologyType
export type OntologyElement = BaseOntologyType & {
    baseUri?: string[];
    classifications?: Classification[];
    creator?: string[];
    description?: string;
    homepage?: string;
    importsFrom?: string[];
    license?: License;
    ontology_purl?: string;
    preferredPrefix: string;
    repo_url?: string;
    title: string;
};

// OntologyEntityResponse now extends BaseOntologyType
export interface OntologyEntityResponse extends BaseOntologyType {
    appearsIn: string[];
    curie: string;
    definedBy: string[];
    definition?: Array<
        | string
        | {
              type: string[];
              value: string;
              axioms?: Array<Record<string, string>>;
          }
    >;
    directAncestor?: string[];
    directParent?: string[];
    hasDirectChildren: boolean;
    hasDirectParents: boolean;
    hasHierarchicalChildren: boolean;
    hasHierarchicalParents: boolean;
    hierarchicalAncestor?: string[];
    hierarchicalParent?: string[];
    hierarchicalProperty?: string;
    isDefiningOntology: boolean;
    isPreferredRoot: boolean;
    linkedEntities?: Record<string, LinkedEntity>;
    ontologyIri: string;
    ontologyPreferredPrefix: string;
    shortForm: string;
    synonym?: string[];
    synonymProperty?: string;
    type: string[];
}
