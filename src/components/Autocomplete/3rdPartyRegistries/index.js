import { CLASSES, ENTITIES } from 'constants/graphSettings';
import getGeoNames from 'services/geoNames/index';
import { searchEntity } from 'services/wikidata';

/**
 *  Fetch autocomplete options from external APIs
 *  the data structure of each option:
 *  {
 *      id: null,
 *      label: 'Label of the option',
 *      external : true,
 *      source: 'Service/Ontology Name'
 *      statements: [{
 *          predicate: { id: 'PREDICATE ID in ORKG', label: 'Label of predicate' }
 *          value: { _class: 'resource|predicate|literal|class',id: null, label: 'Label of value', datatype: 'The datatype if literal' }
 *      }],
 *      tooltipData: [{
 *          property: ''
 *          value: ''
 *      }],
 *      hideId: true
 *  }
 *
 * @param {String} value Search Query
 * @param {Array} prevOptions Loaded options for current search.
 * @return {Array} The list of loaded options including the options from geonames.org with ids = 'GeoNames' and a property external = true
 */
export default function getExternalData({ value, page, pageSize, options, optionsClass, entityType, selectedOntologies }) {
    const promises = [];
    const ontologyIds = selectedOntologies.map(ontology => ontology.id);

    switch (optionsClass) {
        case CLASSES.LOCATION:
            if (!ontologyIds.includes('GeoNames')) {
                ontologyIds.push('GeoNames');
            }
            break;
        default:
            // console.log('No third party registries');
            break;
    }

    if (ontologyIds.includes('GeoNames') && entityType === ENTITIES.RESOURCE) {
        promises.push(getGeoNames({ value, options, pageSize, page }));
    }

    if (ontologyIds.includes('Wikidata')) {
        const classes = {
            [ENTITIES.PREDICATE]: 'property',
            [ENTITIES.RESOURCE]: 'item',
        };

        promises.push(searchEntity({ value, page, pageSize, options, type: classes[entityType] || null, entityType }));
    }

    return promises;
}
