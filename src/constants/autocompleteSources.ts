import { AutocompleteSource, Ontology } from '@/components/Autocomplete/types';

export const AUTOCOMPLETE_SOURCE: { [key: string]: AutocompleteSource } = {
    ORKG: 'orkg',
    OLS_API: 'ols-api',
    WIKIDATA: 'wikidata',
    GEONAMES: 'geonames',
};

export const STORAGE_NAME = 'autocomplete-sources';

export const MAXIMUM_DESCRIPTION_LENGTH = 120;

export const DEFAULT_SOURCES: Ontology[] = [
    {
        id: 'orkg',
        label: 'Open Research Knowledge Graph',
        shortLabel: 'ORKG',
        uri: 'http://orkg.org',
        description: '',
        source: AUTOCOMPLETE_SOURCE.ORKG,
        external: false,
    },
    {
        id: 'wikidata',
        label: 'Wikidata',
        shortLabel: 'Wikidata',
        uri: 'http://wikidata.org',
        description: 'Wikidata is a free and open knowledge base that can be read and edited by both humans and machines.',
        source: AUTOCOMPLETE_SOURCE.WIKIDATA,
        external: true,
    },
    {
        id: 'geonames',
        label: 'GeoNames',
        shortLabel: 'GeoNames',
        uri: 'http://geonames.org',
        description: 'The GeoNames geographical database covers all countries and contains over eleven million placenames.',
        source: AUTOCOMPLETE_SOURCE.GEONAMES,
        external: true,
    },
];

export default AUTOCOMPLETE_SOURCE;
