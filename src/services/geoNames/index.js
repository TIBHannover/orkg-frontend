import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import env from '@beam-australia/react-env';

/**
 * Fetch 10 autocomplete options from geonames.org API
 *
 * @param {String} value Search input
 * @param {Array} prevOptions Loaded options for current search.
 * @return {Array} The list of loaded options including the options from geonames.org
 */
export default async function getGeoNames({ value, pageSize, page }) {
    const options = [];
    let responseXML = await fetch(
        `${env('GEONAMES_API_SEARCH_URL')}?q=${encodeURIComponent(value.trim())}&maxRows=${pageSize}&startRow=${page *
            pageSize}&type=rdf&username=${env('GEONAMES_API_USERNAME')}`,
    );
    const data = await responseXML.text();
    responseXML = new window.DOMParser().parseFromString(data, 'text/xml'); // parse as xml
    const names = responseXML.getElementsByTagName('gn:name');
    const docs = responseXML.getElementsByTagName('gn:Feature');
    const countryCodes = responseXML.getElementsByTagName('gn:countryCode');
    const populations = responseXML.getElementsByTagName('gn:population');
    const lat = responseXML.getElementsByTagName('wgs84_pos:lat');
    const long = responseXML.getElementsByTagName('wgs84_pos:long');
    Array.from(names)?.forEach?.((name, i) => {
        const itemData = {
            id: null,
            label: name.childNodes[0].nodeValue,
            external: true,
            source: 'GeoNames',
            statements: [],
            tooltipData: [],
            ontology: 'GeoNames',
        };
        // load statements
        if (docs[i] && docs[i].attributes) {
            itemData.statements.push({
                predicate: { id: PREDICATES.SAME_AS, label: 'same as' },
                value: {
                    _class: ENTITIES.LITERAL,
                    label: docs[i].attributes.getNamedItem('rdf:about').nodeValue,
                    id: null,
                    datatype: 'xsd:anyURI',
                },
            });
        }
        // add tooltip information
        if (countryCodes[i] && countryCodes[i].childNodes[0].nodeValue) {
            itemData.tooltipData.push({
                property: 'Country Code',
                value: countryCodes[i].childNodes[0].nodeValue,
            });
        }
        if (populations[i] && populations[i].childNodes[0].nodeValue) {
            itemData.tooltipData.push({
                property: 'Population',
                value: populations[i].childNodes[0].nodeValue,
            });
        }
        if (lat[i] && lat[i].childNodes[0].nodeValue) {
            itemData.tooltipData.push({
                property: 'Latitude',
                value: lat[i].childNodes[0].nodeValue,
            });
        }
        if (long[i] && long[i].childNodes[0].nodeValue) {
            itemData.tooltipData.push({
                property: 'Longitude',
                value: long[i].childNodes[0].nodeValue,
            });
        }
        options.push(itemData);
    });
    return { options, hasMore: options.length > 0 };
}
