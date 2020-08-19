import { PREDICATES } from 'constants/graphSettings';

/**
 * Fetch 10 autocomplete options from geonames.org API
 *
 * @param {String} value Search input
 * @param {Array} prevOptions Loaded options for current search.
 * @return {Array} The list of loaded options including the options from geonames.org with ids = 'GeoNames' and a property external = true
 */
export default async function getGeonames(value, options) {
    let responseXML = await fetch(
        'http://api.geonames.org/search?q=' +
            encodeURIComponent(value.trim()) +
            '&maxRows=10&type=rdf&username=' +
            process.env.REACT_APP_GEONAMES_API_USERNAME
    );
    const data = await responseXML.text();
    responseXML = new window.DOMParser().parseFromString(data, 'text/xml'); // parse as xml
    const names = responseXML.getElementsByTagName('gn:name');
    const docs = responseXML.getElementsByTagName('gn:Feature');
    const countryCodes = responseXML.getElementsByTagName('gn:countryCode');
    const populations = responseXML.getElementsByTagName('gn:population');
    const lat = responseXML.getElementsByTagName('wgs84_pos:lat');
    const long = responseXML.getElementsByTagName('wgs84_pos:long');
    names.forEach(function(name, i) {
        const itemData = {
            external: true,
            id: 'GeoNames',
            label: name.childNodes[0].nodeValue,
            statements: [],
            tooltipData: []
        };
        // load statements
        if (docs[i] && docs[i].attributes) {
            itemData['statements'].push({
                predicate: { id: PREDICATES.URL, label: 'URL' },
                value: { type: 'literal', label: docs[i].attributes.getNamedItem('rdf:about').nodeValue, id: null }
            });
        }
        // add tooltip information
        if (countryCodes[i] && countryCodes[i].childNodes[0].nodeValue) {
            itemData['tooltipData'].push({
                property: 'Country Code',
                value: countryCodes[i].childNodes[0].nodeValue
            });
        }
        if (populations[i] && populations[i].childNodes[0].nodeValue) {
            itemData['tooltipData'].push({
                property: 'Population',
                value: populations[i].childNodes[0].nodeValue
            });
        }
        if (lat[i] && lat[i].childNodes[0].nodeValue) {
            itemData['tooltipData'].push({
                property: 'Latitude',
                value: lat[i].childNodes[0].nodeValue
            });
        }
        if (long[i] && long[i].childNodes[0].nodeValue) {
            itemData['tooltipData'].push({
                property: 'Longitude',
                value: long[i].childNodes[0].nodeValue
            });
        }
        options.push(itemData);
    });
    return options;
}
