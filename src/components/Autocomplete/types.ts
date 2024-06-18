import type { GroupBase } from 'react-select';
import type { ComponentProps, UseAsyncPaginateParams } from 'react-select-async-paginate';
import type { CreatableProps } from 'react-select/creatable';
import type { Class, EntityType, Node, Predicate, Resource } from 'services/backend/types';

export type AdditionalType = {
    page: number;
};

export type AutocompleteSource = 'ols-api' | 'orkg' | 'wikidata' | 'geonames';

export type Ontology = {
    id: string;
    label: string;
    // Used for badges
    shortLabel: string;
    uri?: string;
    description?: string;
    external: boolean;
    source: AutocompleteSource;
};

export type OntologyTerm = Ontology & {
    ontology: string;
    shortLabel: string;
    tooltipData: string[];
};

export type OptionType = Node & {
    __isNew__?: boolean;
    description?: string | null;
    isRecommended?: boolean;
    isFixed?: boolean;
    shared?: number;
    classes?: string[];
    tooltipData?: { property: string; value: string | null }[];
    // Statements to import
    statements?: { predicate: string; value: { label: string; _class?: string; datatype?: string } }[];
    // Used to generate the id while importing the option
    ontology?: string;
    _class?: EntityType | null;
    // The uri of the option (if it's external provide the url of the resource in the external service)
    uri?: string | null;
    // To indicate whether the option is loaded from orkg knowledge graph or some external service
    external?: boolean;
    source?: AutocompleteSource;
} & (Partial<Resource> | Partial<Predicate> | Partial<Class>);

export type ExternalServiceResponse = { options: OptionType[]; hasMore: boolean };

export type OptionsSettings = {
    entityType: EntityType;
    baseClass?: string;
    includeClasses?: string[];
    excludeClasses?: string[];
    enableExternalSources?: boolean;
    additionalOptions?: OptionType[];
};

export type AutocompleteProps = {
    allowCreate: boolean;
    defaultValueId?: string | string[];
    onOntologySelectorModalStatusChange?: (v: boolean) => void;
    fixedOptions?: string[];
} & OptionsSettings;
